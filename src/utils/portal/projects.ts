import "server-only";
import { cache } from "react";
import type { PoolClient } from "pg";
import type {
  Phase,
  PortalProject,
  PortalRecord,
  PortalSection,
  PortalUser,
  SectionData,
} from "@/types/portal";
import { query } from "./db";
import { PortalError } from "./http";

const projectSelect = `SELECT p.id,p.client_id,p.name,p.description,p.type,p.scope,p.status,p.starts_on::text,p.due_on::text,p.preview_url,p.public_url,p.updated_at::text,c.name client_name,($2='team' OR coalesce(cu.can_view_finance,false)) can_view_finance FROM projects p JOIN clients c ON c.id=p.client_id LEFT JOIN client_users cu ON cu.client_id=p.client_id AND cu.user_id=$1`;
export const listProjects = cache(async (user: PortalUser) => {
  return query<PortalProject>(
    `${projectSelect} WHERE ($2='team' OR cu.user_id IS NOT NULL) ORDER BY p.created_at DESC`,
    [user.id, user.role],
  );
});
export async function accessProject(
  user: PortalUser,
  id: string,
  finance = false,
  client?: PoolClient,
) {
  const project = (
    await query<PortalProject>(
      `${projectSelect} WHERE p.id=$3 AND ($2='team' OR cu.user_id IS NOT NULL)`,
      [user.id, user.role, id],
      client,
    )
  )[0];
  if (!project)
    throw new PortalError("Você não possui acesso a este projeto.", 403);
  if (finance && !project.can_view_finance)
    throw new PortalError(
      "Você não possui acesso ao financeiro deste projeto.",
      403,
    );
  return project;
}
export async function loadPhases(projectId: string) {
  return query<Phase>(
    `SELECT p.id,p.title,p.description,p.status,p.owner,p.starts_on::text,p.due_on::text,p.completed_on::text,p.notes,p.created_at::text,count(t.id)::integer total_tasks,count(t.id) FILTER(WHERE t.status='completed')::integer completed_tasks FROM project_phases p LEFT JOIN project_tasks t ON t.phase_id=p.id AND t.project_id=p.project_id WHERE p.project_id=$1 GROUP BY p.id ORDER BY p.position,p.created_at`,
    [projectId],
  );
}
const lists = {
  atualizacoes: {
    table: "project_updates",
    columns:
      "t.id,t.title,t.description,t.type,t.related_url,t.created_at::text,u.name author",
    join: "JOIN portal_users u ON u.id=t.author_id",
  },
  entregas: {
    table: "project_deliveries",
    columns:
      "t.id,t.title,t.version,t.description,t.url,t.status,t.created_at::text,u.name author",
    join: "JOIN portal_users u ON u.id=t.author_id",
  },
  aprovacoes: {
    table: "project_approvals",
    columns:
      "t.id,t.title,t.version,t.description,t.url,t.status,t.comment,t.decided_at::text,t.created_at::text,u.name decided_by_name",
    join: "LEFT JOIN portal_users u ON u.id=t.decided_by",
  },
  solicitacoes: {
    table: "project_requests",
    columns:
      "t.id,t.number::text,t.title,t.category,t.module,t.client_priority,t.description,t.owner,t.status,t.created_at::text,u.name author",
    join: "JOIN portal_users u ON u.id=t.author_id",
  },
  arquivos: {
    table: "project_files",
    columns:
      "t.id,t.name,t.mime,t.size,t.category,t.request_id,t.message_id,t.created_at::text,u.name author",
    join: "JOIN portal_users u ON u.id=t.author_id",
  },
  mensagens: {
    table: "project_messages",
    columns:
      "t.id,t.message,t.created_at::text,u.name author,u.role author_role",
    join: "JOIN portal_users u ON u.id=t.author_id",
  },
  financeiro: {
    table: "project_payments",
    columns:
      "t.id,t.title,t.amount_cents::text,t.due_on::text,t.status,t.paid_on::text,t.created_at::text,sum(t.amount_cents) FILTER(WHERE t.status<>'cancelled') OVER()::text total_cents,coalesce(sum(t.amount_cents) FILTER(WHERE t.status='paid') OVER(),0)::text paid_cents",
    join: "",
  },
} as const;
export async function loadSection(
  user: PortalUser,
  project: PortalProject,
  section: PortalSection,
  page: number,
  search = "",
  category = "",
  requestId = "",
): Promise<SectionData> {
  await accessProject(user, project.id, section === "financeiro");
  if (
    section === "dashboard" ||
    section === "projeto" ||
    section === "cronograma" ||
    section === "etapas"
  ) {
    const [
      phases,
      tasks,
      milestones,
      team,
      updates,
      approvals,
      deliveries,
      requests,
      lastMessage,
      payments,
    ] = await Promise.all([
      loadPhases(project.id),
      query<PortalRecord>(
        "SELECT id,phase_id,title,status,created_at::text FROM project_tasks WHERE project_id=$1 ORDER BY created_at",
        [project.id],
      ),
      query<PortalRecord>(
        "SELECT id,title,due_on::text,status,created_at::text FROM project_milestones WHERE project_id=$1 ORDER BY due_on",
        [project.id],
      ),
      query<PortalRecord>(
        "SELECT id,name,role,created_at::text FROM project_members WHERE project_id=$1 ORDER BY created_at",
        [project.id],
      ),
      section === "dashboard" || section === "cronograma"
        ? query<PortalRecord>(
            "SELECT t.id,t.title,t.description,t.type,t.related_url,t.created_at::text,u.name author FROM project_updates t JOIN portal_users u ON u.id=t.author_id WHERE t.project_id=$1 ORDER BY t.created_at DESC LIMIT 8",
            [project.id],
          )
        : [],
      section === "dashboard" || section === "cronograma"
        ? query<PortalRecord>(
            "SELECT id,title,version,status,description,created_at::text FROM project_approvals WHERE project_id=$1 AND status='pending' ORDER BY created_at LIMIT 5",
            [project.id],
          )
        : [],
      section === "dashboard" || section === "cronograma"
        ? query<PortalRecord>(
            "SELECT id,title,version,url,status,description,created_at::text FROM project_deliveries WHERE project_id=$1 ORDER BY created_at DESC LIMIT 3",
            [project.id],
          )
        : [],
      section === "dashboard"
        ? query<PortalRecord>(
            "SELECT id,title,status,created_at::text FROM project_requests WHERE project_id=$1 ORDER BY created_at DESC LIMIT 3",
            [project.id],
          )
        : [],
      section === "dashboard"
        ? query<PortalRecord>(
            "SELECT m.id,m.message,m.created_at::text,u.name author FROM project_messages m JOIN portal_users u ON u.id=m.author_id WHERE m.project_id=$1 AND u.role='team' ORDER BY m.created_at DESC LIMIT 1",
            [project.id],
          )
        : [],
      section === "dashboard" && project.can_view_finance
        ? query<PortalRecord>(
            "SELECT id,title,amount_cents::text,status,due_on::text,created_at::text FROM project_payments WHERE project_id=$1 AND status<>'cancelled' ORDER BY due_on",
            [project.id],
          )
        : [],
    ]);
    return {
      items: updates,
      total: updates.length,
      page,
      phases,
      tasks,
      milestones,
      team,
      approvals,
      deliveries,
      requests,
      lastMessage: lastMessage[0],
      payments,
    };
  }
  if (section in lists) {
    const list = lists[section as keyof typeof lists];
    const values: unknown[] = [project.id];
    let where = "t.project_id=$1";
    if (section === "arquivos") {
      if (search) {
        values.push(`%${search}%`);
        where += ` AND t.name ILIKE $${values.length}`;
      }
      if (category) {
        values.push(category);
        where += ` AND t.category=$${values.length}`;
      }
    }
    if (section === "solicitacoes" && requestId) {
      values.push(requestId);
      where += ` AND t.id=$${values.length}`;
    }
    const count = await query<{ total: string }>(
      `SELECT count(*) total FROM ${list.table} t WHERE ${where}`,
      values,
    );
    const items = await query<PortalRecord>(
      `SELECT ${list.columns} FROM ${list.table} t ${list.join} WHERE ${where} ORDER BY t.created_at DESC LIMIT 20 OFFSET $${values.length + 1}`,
      [
        ...values,
        section === "solicitacoes" && requestId ? 0 : (page - 1) * 20,
      ],
    );
    let comments: PortalRecord[] = [];
    let files: PortalRecord[] = [];
    if (section === "solicitacoes" && requestId && items.length) {
      count[0].total = (
        await query<{ total: string }>(
          "SELECT count(*) total FROM project_request_comments WHERE project_id=$1 AND request_id=$2",
          [project.id, requestId],
        )
      )[0].total;
      comments = await query<PortalRecord>(
        "SELECT c.id,c.message,c.created_at::text,u.name author,u.role author_role FROM project_request_comments c JOIN portal_users u ON u.id=c.author_id WHERE c.project_id=$1 AND c.request_id=$2 ORDER BY c.created_at DESC LIMIT 20 OFFSET $3",
        [project.id, requestId, (page - 1) * 20],
      );
      files = await query<PortalRecord>(
        "SELECT id,name,size,mime,category,created_at::text FROM project_files WHERE project_id=$1 AND request_id=$2 ORDER BY created_at DESC LIMIT 20",
        [project.id, requestId],
      );
    }
    let tasks: PortalRecord[] = [];
    if (section === "entregas" && items.length)
      tasks = await query<PortalRecord>(
        "SELECT id,title,delivery_id FROM project_delivery_items WHERE project_id=$1 AND delivery_id=ANY($2::uuid[])",
        [project.id, items.map((item) => item.id)],
      );
    if (section === "mensagens" && items.length) {
      files = await query<PortalRecord>(
        "SELECT id,name,size,mime,category,message_id,created_at::text FROM project_files WHERE project_id=$1 AND message_id=ANY($2::uuid[]) ORDER BY created_at DESC",
        [project.id, items.map((item) => item.id)],
      );
    }
    return {
      items,
      total: Number(count[0].total),
      page,
      comments,
      files,
      tasks,
    };
  }
  return { items: [], total: 0, page };
}

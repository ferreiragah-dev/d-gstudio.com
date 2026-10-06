import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireUser, rateLimit } from "@/utils/portal/auth";
import { query, transaction } from "@/utils/portal/db";
import { accessProject } from "@/utils/portal/projects";
import {
  json,
  portalFailure,
  PortalError,
  readJson,
} from "@/utils/portal/http";
import { uuid, newPassword } from "@/utils/portal/validation";
import { adminTable, entitySchemas, projectSchema } from "@/utils/portal/admin";
import { adminEntities } from "@/config/portal-admin";
import { audit, notify, publishActivity } from "@/utils/portal/activity";
import { hashPassword } from "@/utils/portal/password";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const user = await requireUser();
    if (user.role !== "team")
      throw new PortalError("Acesso reservado à equipe.", 403);
    await rateLimit(`admin:${user.id}`, 100, 60);
    const envelope = z
      .object({
        action: z.string(),
        projectId: uuid.optional(),
        id: uuid.optional(),
        entity: z.string().optional(),
        data: z.record(z.string(), z.unknown()),
      })
      .parse(body);
    const id = envelope.id || randomUUID();
    if (envelope.action === "client") {
      const data = z
        .object({ name: z.string().trim().min(2).max(200) })
        .parse(envelope.data);
      await query("INSERT INTO clients(id,name) VALUES($1,$2)", [
        id,
        data.name,
      ]);
      return json({ id, message: "Cliente criado." });
    }
    if (envelope.action === "user") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(100),
          email: z.email().trim().toLowerCase(),
          password: newPassword,
          client_id: uuid,
          can_view_finance: z.boolean(),
        })
        .parse(envelope.data);
      const hash = await hashPassword(data.password);
      await transaction(async (client) => {
        await query(
          "INSERT INTO portal_users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,'client')",
          [id, data.name, data.email, hash],
          client,
        );
        await query(
          "INSERT INTO client_users(client_id,user_id,can_view_finance) VALUES($1,$2,$3)",
          [data.client_id, id, data.can_view_finance],
          client,
        );
      });
      return json({
        id,
        message:
          "Usuário criado. Compartilhe a senha inicial por um canal privado.",
      });
    }
    if (envelope.action === "membership") {
      const data = z
        .object({
          user_id: uuid,
          client_id: uuid,
          can_view_finance: z.boolean(),
          remove: z.boolean().default(false),
        })
        .parse(envelope.data);
      if (data.remove)
        await query(
          "DELETE FROM client_users WHERE user_id=$1 AND client_id=$2",
          [data.user_id, data.client_id],
        );
      else
        await query(
          "INSERT INTO client_users(user_id,client_id,can_view_finance) VALUES($1,$2,$3) ON CONFLICT(user_id,client_id) DO UPDATE SET can_view_finance=excluded.can_view_finance",
          [data.user_id, data.client_id, data.can_view_finance],
        );
      return json({ message: "Permissões atualizadas." });
    }
    if (envelope.action === "project") {
      const data = projectSchema.parse(envelope.data);
      await transaction(async (client) => {
        if (envelope.id) {
          await accessProject(user, id, false, client);
          const columns = Object.keys(data);
          await query(
            `UPDATE projects SET ${columns.map((column, index) => `${column}=$${index + 1}`).join(",")} WHERE id=$${columns.length + 1}`,
            [...Object.values(data), id],
            client,
          );
        } else {
          const clientId = uuid.parse(envelope.data.client_id);
          const columns = Object.keys(data);
          await query(
            `INSERT INTO projects(id,client_id,${columns.join(",")}) VALUES($1,$2,${columns.map((_, index) => `$${index + 3}`).join(",")})`,
            [id, clientId, ...Object.values(data)],
            client,
          );
        }
        await audit(client, id, user, "TEAM_UPDATED_PROJECT", "project", id);
        await publishActivity(
          client,
          id,
          user,
          "Projeto atualizado",
          "As informações e o cronograma do projeto foram atualizados.",
          "update",
        );
        await notify(
          client,
          id,
          user,
          "Informações do projeto atualizadas",
          "projeto",
        );
      });
      return json({ id, message: "Projeto salvo." });
    }
    const projectId = uuid.parse(envelope.projectId);
    if (envelope.action === "request-status") {
      const data = z
        .object({
          status: z.enum([
            "received",
            "analysis",
            "approved",
            "in_progress",
            "testing",
            "completed",
            "rejected",
            "waiting_client",
          ]),
          owner: z.string().trim().max(200),
          team_priority: z.enum(["Baixa", "Normal", "Alta"]),
        })
        .parse(envelope.data);
      if (!envelope.id) throw new PortalError("Selecione uma solicitação.");
      await transaction(async (client) => {
        await accessProject(user, projectId, false, client);
        const rows = await query(
          "UPDATE project_requests SET status=$1,owner=$2,team_priority=$3 WHERE id=$4 AND project_id=$5 RETURNING id",
          [data.status, data.owner, data.team_priority, id, projectId],
          client,
        );
        if (!rows.length)
          throw new PortalError("Solicitação não encontrada.", 404);
        await audit(
          client,
          projectId,
          user,
          "TEAM_UPDATED_REQUEST",
          "request",
          id,
          { status: data.status },
        );
        await publishActivity(
          client,
          projectId,
          user,
          "Solicitação atualizada",
          `Situação: ${data.status === "completed" ? "Concluída" : "Atualizada pela equipe"}`,
          "update",
        );
        await notify(
          client,
          projectId,
          user,
          data.status === "completed"
            ? "Sua solicitação foi concluída"
            : "Sua solicitação foi atualizada",
          "solicitacoes",
        );
      });
      return json({ message: "Solicitação atualizada." });
    }
    if (envelope.action !== "entity" || !envelope.entity)
      throw new PortalError("Operação inválida.");
    const entity = envelope.entity;
    const table = adminTable(entity);
    if (!table) throw new PortalError("Tipo inválido.");
    if (envelope.id && !adminEntities[entity].editable)
      throw new PortalError(
        "Históricos publicados são preservados. Crie uma nova versão.",
      );
    const data = entitySchemas[entity].parse(envelope.data) as Record<
      string,
      unknown
    >;
    const columns = Object.keys(data);
    await transaction(async (client) => {
      await accessProject(user, projectId, false, client);
      for (const [field, parent] of [
        ["phase_id", "project_phases"],
        ["delivery_id", "project_deliveries"],
      ]) {
        if (
          data[field] &&
          !(
            await query(
              `SELECT id FROM ${parent} WHERE id=$1 AND project_id=$2`,
              [data[field], projectId],
              client,
            )
          ).length
        )
          throw new PortalError(
            "O item relacionado não pertence a este projeto.",
          );
      }
      if (envelope.id) {
        const rows = await query(
          `UPDATE ${table} SET ${columns.map((column, index) => `${column}=$${index + 1}`).join(",")} WHERE id=$${columns.length + 1} AND project_id=$${columns.length + 2} RETURNING id`,
          [...Object.values(data), id, projectId],
          client,
        );
        if (!rows.length)
          throw new PortalError("Registro não encontrado.", 404);
      } else {
        if (["deliveries", "updates"].includes(entity)) {
          data.author_id = user.id;
          columns.push("author_id");
        }
        await query(
          `INSERT INTO ${table}(id,project_id,${columns.join(",")}) VALUES($1,$2,${columns.map((_, index) => `$${index + 3}`).join(",")})`,
          [id, projectId, ...Object.values(data)],
          client,
        );
        if (entity === "deliveries") {
          await query(
            "INSERT INTO project_approvals(id,project_id,delivery_id,title,version,description,url) VALUES($1,$2,$3,$4,$5,$6,$7)",
            [
              randomUUID(),
              projectId,
              id,
              data.title,
              data.version,
              data.description,
              data.url,
            ],
            client,
          );
          await notify(
            client,
            projectId,
            user,
            "Uma entrega aguarda sua aprovação",
            "aprovacoes",
          );
        }
      }
      await audit(
        client,
        projectId,
        user,
        entity === "deliveries"
          ? "TEAM_PUBLISHED_VERSION"
          : entity === "phases" && data.status === "completed"
            ? "PROJECT_PHASE_COMPLETED"
            : "TEAM_UPDATED_PROJECT",
        entity,
        id,
      );
      const section =
        entity === "approvals"
          ? "aprovacoes"
          : entity === "deliveries"
            ? "entregas"
            : entity === "payments"
              ? "financeiro"
              : "dashboard";
      const title =
        entity === "deliveries"
          ? "Nova versão disponível"
          : entity === "approvals"
            ? "Uma entrega aguarda sua aprovação"
            : "Projeto atualizado pela equipe";
      if (entity !== "updates" && entity !== "payments")
        await publishActivity(
          client,
          projectId,
          user,
          title,
          String(data.title || data.name || "Andamento atualizado"),
          entity === "deliveries" ? "delivery" : "update",
        );
      await notify(
        client,
        projectId,
        user,
        title,
        section,
        entity === "payments",
      );
    });
    return json({ id, message: "Registro salvo." });
  } catch (error) {
    return portalFailure(error);
  }
}

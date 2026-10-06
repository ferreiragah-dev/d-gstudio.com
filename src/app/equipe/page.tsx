import { pageUser } from "@/utils/portal/auth";
import { accessProject, listProjects } from "@/utils/portal/projects";
import { adminTable } from "@/utils/portal/admin";
import { adminEntities } from "@/config/portal-admin";
import { query } from "@/utils/portal/db";
import { uuid } from "@/utils/portal/validation";
import type { PortalRecord } from "@/types/portal";
import { AdminConsole } from "@/components/portal/admin-console";
import { ButtonLink } from "@/components/ui";
import { ProjectPicker } from "@/components/portal/project-picker";
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await pageUser(true);
  const params = await searchParams;
  const projects = await listProjects(user);
  if (!params.projeto && params.gestao !== "1")
    return <ProjectPicker projects={projects} />;
  const id = uuid.safeParse(params.projeto).success
    ? params.projeto
    : undefined;
  const entity =
    params.tipo &&
    (Object.hasOwn(adminEntities, params.tipo) || params.tipo === "requests")
      ? params.tipo
      : "phases";
  const page = Math.max(1, Number.parseInt(params.pagina || "1", 10) || 1);
  const [clients, users, memberships] = await Promise.all([
    query<{ id: string; name: string }>(
      "SELECT id,name FROM clients ORDER BY name LIMIT 200",
    ),
    query<{ id: string; name: string }>(
      "SELECT id,name FROM portal_users WHERE role='client' ORDER BY name LIMIT 200",
    ),
    query<PortalRecord>(
      "SELECT cu.user_id::text || ':' || cu.client_id::text id,u.name user_name,c.name client_name,cu.can_view_finance,now()::text created_at FROM client_users cu JOIN clients c ON c.id=cu.client_id JOIN portal_users u ON u.id=cu.user_id ORDER BY u.name LIMIT 200",
    ),
  ]);
  const project = id ? await accessProject(user, id) : undefined;
  const table = entity === "requests" ? "project_requests" : adminTable(entity);
  let records: PortalRecord[] = [];
  let activity: PortalRecord[] = [];
  let phases: { id: string; name: string }[] = [];
  let deliveries: { id: string; name: string }[] = [];
  if (project && table) {
    const fields =
      entity === "requests"
        ? ["title", "status", "owner", "team_priority"]
        : adminEntities[entity].fields.map((field) => field.name);
    const columns = fields
      .map((field) =>
        [
          "starts_on",
          "due_on",
          "completed_on",
          "paid_on",
          "amount_cents",
        ].includes(field)
          ? `${field}::text`
          : field,
      )
      .join(",");
    [records, activity, phases, deliveries] = await Promise.all([
      query<PortalRecord>(
        `SELECT id,${columns} FROM ${table} WHERE project_id=$1 ORDER BY created_at DESC LIMIT 20 OFFSET $2`,
        [project.id, (page - 1) * 20],
      ),
      query<PortalRecord>(
        "SELECT a.id,a.action,a.created_at::text,u.name author FROM project_activity_log a JOIN portal_users u ON u.id=a.user_id WHERE a.project_id=$1 ORDER BY a.created_at DESC LIMIT 20",
        [project.id],
      ),
      query<{ id: string; name: string }>(
        "SELECT id,title name FROM project_phases WHERE project_id=$1 ORDER BY position LIMIT 200",
        [project.id],
      ),
      query<{ id: string; name: string }>(
        "SELECT id,title || ' • ' || version name FROM project_deliveries WHERE project_id=$1 ORDER BY created_at DESC LIMIT 200",
        [project.id],
      ),
    ]);
  }
  return (
    <>
      <AdminConsole
        projects={projects}
        clients={clients}
        users={users}
        project={project}
        entity={entity}
        records={records}
        relations={{ phases, deliveries }}
        activity={activity}
        memberships={memberships}
      />
      {project && (
        <nav className="portal-row" aria-label="Paginação da administração">
          {page > 1 && (
            <ButtonLink
              href={`/equipe?projeto=${project.id}&tipo=${entity}&pagina=${page - 1}`}
              variant="secondary"
            >
              Anterior
            </ButtonLink>
          )}
          {records.length === 20 && (
            <ButtonLink
              href={`/equipe?projeto=${project.id}&tipo=${entity}&pagina=${page + 1}`}
              variant="secondary"
            >
              Próxima
            </ButtonLink>
          )}
        </nav>
      )}
    </>
  );
}

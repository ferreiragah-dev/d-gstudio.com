import "server-only";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { PortalUser } from "@/types/portal";
import { query } from "./db";

export async function audit(
  client: PoolClient,
  projectId: string,
  user: PortalUser,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await query(
    "INSERT INTO project_activity_log(id,project_id,user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      randomUUID(),
      projectId,
      user.id,
      action,
      entityType,
      entityId,
      JSON.stringify(metadata),
    ],
    client,
  );
  await query(
    "UPDATE projects SET updated_at=now() WHERE id=$1",
    [projectId],
    client,
  );
}
export async function notify(
  client: PoolClient,
  projectId: string,
  actor: PortalUser,
  title: string,
  section: string,
  finance = false,
) {
  const recipients = await query<{ id: string }>(
    `SELECT DISTINCT u.id FROM portal_users u LEFT JOIN client_users cu ON cu.user_id=u.id LEFT JOIN projects p ON p.client_id=cu.client_id WHERE NOT u.disabled AND u.notifications_enabled AND u.id<>$2 AND (u.role='team' OR (p.id=$1 AND ($3=false OR cu.can_view_finance)))`,
    [projectId, actor.id, finance],
    client,
  );
  for (const user of recipients)
    await query(
      "INSERT INTO project_notifications(id,project_id,user_id,title,section) VALUES($1,$2,$3,$4,$5)",
      [randomUUID(), projectId, user.id, title, section],
      client,
    );
}
export async function publishActivity(
  client: PoolClient,
  projectId: string,
  user: PortalUser,
  title: string,
  description: string,
  type: string,
) {
  await query(
    "INSERT INTO project_updates(id,project_id,author_id,title,description,type) VALUES($1,$2,$3,$4,$5,$6)",
    [randomUUID(), projectId, user.id, title, description, type],
    client,
  );
}

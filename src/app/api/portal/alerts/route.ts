import { requireUser } from "@/utils/portal/auth";
import { accessProject } from "@/utils/portal/projects";
import { query } from "@/utils/portal/db";
import { json, portalFailure } from "@/utils/portal/http";
import { uuid } from "@/utils/portal/validation";
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const projectId = uuid.parse(
      new URL(request.url).searchParams.get("project"),
    );
    const project = await accessProject(user, projectId);
    if (project.can_view_finance && user.notifications_enabled) {
      await query(
        "INSERT INTO project_notifications(id,project_id,user_id,title,section,dedupe_key) SELECT gen_random_uuid(),p.project_id,$1::uuid,'Pagamento próximo do vencimento: ' || p.title,'financeiro',($1::uuid)::text || ':' || p.id::text || ':' || p.due_on::text FROM project_payments p WHERE p.project_id=$2 AND p.status='pending' AND p.due_on BETWEEN current_date AND current_date+7 ON CONFLICT(dedupe_key) DO NOTHING",
        [user.id, projectId],
      );
    }
    const items = await query(
      "SELECT id,title,section,read_at::text,created_at::text FROM project_notifications WHERE user_id=$1 AND project_id=$2 AND (section<>'financeiro' OR $3) ORDER BY created_at DESC LIMIT 30",
      [user.id, projectId, project.can_view_finance],
    );
    const count = await query<{ count: string }>(
      "SELECT count(*) count FROM project_notifications WHERE user_id=$1 AND project_id=$2 AND read_at IS NULL AND (section<>'financeiro' OR $3)",
      [user.id, projectId, project.can_view_finance],
    );
    return json({ items, unread: Number(count[0].count) });
  } catch (error) {
    return portalFailure(error);
  }
}

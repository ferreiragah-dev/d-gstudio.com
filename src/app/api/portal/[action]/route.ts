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
import {
  approvalSchema,
  messageSchema,
  profileSchema,
  requestSchema,
  uuid,
} from "@/utils/portal/validation";
import { audit, notify, publishActivity } from "@/utils/portal/activity";
import { hashPassword, verifyPassword } from "@/utils/portal/password";
export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  try {
    const body = await readJson(request);
    const user = await requireUser();
    await rateLimit(`mutation:${user.id}`, 80, 60);
    const { action } = await context.params;
    if (action === "welcome") {
      await query(
        "UPDATE portal_users SET welcomed_at=coalesce(welcomed_at,now()) WHERE id=$1",
        [user.id],
      );
      return json({ message: "Bem-vindo!" });
    }
    if (action === "profile") {
      const data = profileSchema.parse(body);
      if (data.password) {
        await rateLimit(`password:${user.id}`, 5);
        const row = (
          await query<{ password_hash: string }>(
            "SELECT password_hash FROM portal_users WHERE id=$1",
            [user.id],
          )
        )[0];
        if (!(await verifyPassword(data.currentPassword, row.password_hash)))
          throw new PortalError("A senha atual está incorreta.");
      }
      const hash = data.password ? await hashPassword(data.password) : null;
      await transaction(async (client) => {
        await query(
          "UPDATE portal_users SET name=$1,phone=$2,notifications_enabled=$3,password_hash=coalesce($4,password_hash) WHERE id=$5",
          [data.name, data.phone, data.notifications_enabled, hash, user.id],
          client,
        );
        if (hash) {
          await query(
            "DELETE FROM portal_sessions WHERE user_id=$1",
            [user.id],
            client,
          );
          await query(
            "DELETE FROM portal_password_resets WHERE user_id=$1",
            [user.id],
            client,
          );
        }
      });
      return json({
        message: "Dados atualizados.",
        ...(hash ? { redirect: "/cliente/login" } : {}),
      });
    }
    if (action === "notifications") {
      const data = z
        .object({ id: uuid.optional(), projectId: uuid })
        .parse(body);
      await accessProject(user, data.projectId);
      await query(
        "UPDATE project_notifications SET read_at=now() WHERE user_id=$1 AND project_id=$2 AND ($3::uuid IS NULL OR id=$3)",
        [user.id, data.projectId, data.id || null],
      );
      return json({ message: "Notificações atualizadas." });
    }
    if (action === "request") {
      const data = requestSchema.parse(body);
      const id = randomUUID();
      await transaction(async (client) => {
        await accessProject(user, data.projectId, false, client);
        await query(
          "INSERT INTO project_requests(id,project_id,author_id,title,category,module,client_priority,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
          [
            id,
            data.projectId,
            user.id,
            data.title,
            data.category,
            data.module,
            data.client_priority,
            data.description,
          ],
          client,
        );
        await audit(
          client,
          data.projectId,
          user,
          "CLIENT_REQUESTED_CHANGE",
          "request",
          id,
        );
        await publishActivity(
          client,
          data.projectId,
          user,
          "Solicitação recebida",
          data.title,
          "client_request",
        );
        await notify(
          client,
          data.projectId,
          user,
          "Nova solicitação recebida",
          "solicitacoes",
        );
      });
      return json(
        {
          id,
          message: "Solicitação recebida. Nossa equipe vai analisar sua ideia.",
        },
        201,
      );
    }
    if (action === "message" || action === "comment") {
      const data = messageSchema.parse(body);
      const id = randomUUID();
      await transaction(async (client) => {
        await accessProject(user, data.projectId, false, client);
        if (action === "comment") {
          if (!data.requestId)
            throw new PortalError("Selecione a solicitação.");
          const exists = await query(
            "SELECT id FROM project_requests WHERE id=$1 AND project_id=$2",
            [data.requestId, data.projectId],
            client,
          );
          if (!exists.length)
            throw new PortalError("Solicitação não encontrada.", 404);
          await query(
            "INSERT INTO project_request_comments(id,project_id,request_id,author_id,message) VALUES($1,$2,$3,$4,$5)",
            [id, data.projectId, data.requestId, user.id, data.message],
            client,
          );
        } else
          await query(
            "INSERT INTO project_messages(id,project_id,author_id,message) VALUES($1,$2,$3,$4)",
            [id, data.projectId, user.id, data.message],
            client,
          );
        await audit(
          client,
          data.projectId,
          user,
          "CLIENT_ADDED_COMMENT",
          action,
          id,
        );
        await notify(
          client,
          data.projectId,
          user,
          user.role === "team"
            ? "Nova mensagem da equipe"
            : "Nova mensagem do cliente",
          action === "comment" ? "solicitacoes" : "mensagens",
        );
      });
      return json({ id, message: "Mensagem enviada." }, 201);
    }
    if (action === "approval") {
      const data = approvalSchema.parse(body);
      await transaction(async (client) => {
        await accessProject(user, data.projectId, false, client);
        const approval = (
          await query<{
            id: string;
            title: string;
            version: string;
            status: string;
            delivery_id: string | null;
          }>(
            "SELECT id,title,version,status,delivery_id FROM project_approvals WHERE id=$1 AND project_id=$2 FOR UPDATE",
            [data.id, data.projectId],
            client,
          )
        )[0];
        if (!approval) throw new PortalError("Aprovação não encontrada.", 404);
        if (approval.status !== "pending")
          throw new PortalError(
            "Este item já foi revisado. Atualize a página para conferir.",
            409,
          );
        await query(
          "UPDATE project_approvals SET status=$1,decided_by=$2,decided_at=now(),comment=$3 WHERE id=$4",
          [data.decision, user.id, data.comment, data.id],
          client,
        );
        if (approval.delivery_id)
          await query(
            "UPDATE project_deliveries SET status=$1 WHERE id=$2 AND project_id=$3",
            [data.decision, approval.delivery_id, data.projectId],
            client,
          );
        await audit(
          client,
          data.projectId,
          user,
          data.decision === "approved"
            ? "CLIENT_APPROVED_DELIVERY"
            : "CLIENT_REQUESTED_CHANGE",
          "approval",
          data.id,
          {
            version: approval.version,
            decision: data.decision,
            comment: data.comment,
          },
        );
        await publishActivity(
          client,
          data.projectId,
          user,
          data.decision === "approved"
            ? "Entrega aprovada"
            : "Ajuste solicitado",
          `${approval.title} • ${approval.version}`,
          data.decision === "approved" ? "approval" : "revision",
        );
        await notify(
          client,
          data.projectId,
          user,
          "Uma aprovação foi revisada",
          "aprovacoes",
        );
      });
      return json({
        message:
          data.decision === "approved"
            ? "Aprovação registrada."
            : "Pedido de ajuste registrado.",
      });
    }
    throw new PortalError("Operação não encontrada.", 404);
  } catch (error) {
    return portalFailure(error);
  }
}

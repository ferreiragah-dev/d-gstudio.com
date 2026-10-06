import { z } from "zod";
import { loginSchema, newPassword } from "@/utils/portal/validation";
import { createSession, logout, rateLimit } from "@/utils/portal/auth";
import { query, transaction } from "@/utils/portal/db";
import {
  hashPassword,
  randomToken,
  tokenHash,
  verifyPassword,
} from "@/utils/portal/password";
import {
  json,
  portalFailure,
  PortalError,
  readJson,
} from "@/utils/portal/http";
import { sendResetMail } from "@/utils/portal/mail";
export const runtime = "nodejs";
const dummyHash = "scrypt:" + "0".repeat(48) + ":" + "0".repeat(128);
export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await context.params;
    const body = await readJson(request);
    if (action === "login") {
      const data = loginSchema.parse(body);
      await rateLimit(`login:${data.email}`);
      const user = (
        await query<{ id: string; password_hash: string; role: string }>(
          "SELECT id,password_hash,role FROM portal_users WHERE email=$1 AND NOT disabled",
          [data.email],
        )
      )[0];
      const valid = await verifyPassword(
        data.password,
        user?.password_hash || dummyHash,
      );
      if (!user || !valid)
        throw new PortalError("E-mail ou senha incorretos.", 401);
      await createSession(user.id, data.remember);
      return json({
        redirect: user.role === "team" ? "/equipe" : "/cliente/dashboard",
      });
    }
    if (action === "logout") {
      await logout();
      return json({ redirect: "/cliente/login" });
    }
    if (action === "forgot") {
      const { email } = z
        .object({ email: z.email().trim().toLowerCase() })
        .parse(body);
      await rateLimit(`reset:${email}`, 3, 1800);
      // Configuration failures are identical for all email addresses.
      if (
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASSWORD ||
        !process.env.NEXT_PUBLIC_SITE_URL
      )
        throw new PortalError(
          "Recuperação indisponível no momento. Entre em contato com nossa equipe.",
          503,
        );
      const user = (
        await query<{ id: string }>(
          "SELECT id FROM portal_users WHERE email=$1 AND NOT disabled",
          [email],
        )
      )[0];
      if (user) {
        const token = randomToken();
        await transaction(async (client) => {
          await query(
            "SELECT id FROM portal_users WHERE id=$1 FOR UPDATE",
            [user.id],
            client,
          );
          await query(
            "DELETE FROM portal_password_resets WHERE user_id=$1",
            [user.id],
            client,
          );
          await query(
            "INSERT INTO portal_password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",
            [tokenHash(token), user.id],
            client,
          );
        });
        try {
          await sendResetMail(email, token);
        } catch {
          await query(
            "DELETE FROM portal_password_resets WHERE token_hash=$1",
            [tokenHash(token)],
          );
          console.error("Portal reset mail unavailable");
        }
      }
      return json({
        message:
          "Se este e-mail possui acesso, você receberá um link para redefinir sua senha.",
      });
    }
    if (action === "reset") {
      const data = z
        .object({
          token: z.string().regex(/^[a-f0-9]{64}$/),
          password: newPassword,
        })
        .parse(body);
      await rateLimit(`reset-token:${data.token}`, 6);
      const hash = await hashPassword(data.password);
      await transaction(async (client) => {
        const reset = (
          await query<{ user_id: string }>(
            "DELETE FROM portal_password_resets WHERE token_hash=$1 AND expires_at>now() RETURNING user_id",
            [tokenHash(data.token)],
            client,
          )
        )[0];
        if (!reset)
          throw new PortalError(
            "Este link expirou ou já foi utilizado. Solicite um novo.",
          );
        await query(
          "UPDATE portal_users SET password_hash=$1 WHERE id=$2 AND NOT disabled",
          [hash, reset.user_id],
          client,
        );
        await query(
          "DELETE FROM portal_sessions WHERE user_id=$1",
          [reset.user_id],
          client,
        );
        await query(
          "DELETE FROM portal_password_resets WHERE user_id=$1",
          [reset.user_id],
          client,
        );
      });
      return json({
        message: "Senha atualizada. Entre com sua nova senha.",
        redirect: "/cliente/login",
      });
    }
    throw new PortalError("Página não encontrada.", 404);
  } catch (error) {
    return portalFailure(error);
  }
}

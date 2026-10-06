import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { query } from "./db";
import { randomToken, tokenHash } from "./password";
import { PortalError } from "./http";
import type { PortalUser } from "@/types/portal";

const cookieName =
  process.env.NODE_ENV === "production" ? "__Host-dg-portal" : "dg-portal";
export async function rateLimit(key: string, max = 8, seconds = 900) {
  const rows = await query<{ attempts: number }>(
    `INSERT INTO portal_rate_limits(key,attempts,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN portal_rate_limits.expires_at<now() THEN 1 ELSE portal_rate_limits.attempts+1 END,expires_at=CASE WHEN portal_rate_limits.expires_at<now() THEN excluded.expires_at ELSE portal_rate_limits.expires_at END RETURNING attempts`,
    [tokenHash(key), seconds],
  );
  if (rows[0].attempts > max)
    throw new PortalError(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      429,
    );
}
export const currentUser = cache(async (): Promise<PortalUser | null> => {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const rows = await query<PortalUser>(
    `SELECT u.id,u.name,u.email,u.role,u.phone,u.notifications_enabled,u.welcomed_at::text FROM portal_users u JOIN portal_sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now() AND NOT u.disabled`,
    [tokenHash(token)],
  );
  return rows[0] || null;
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new PortalError("Entre novamente para continuar.", 401);
  return user;
}
export async function pageUser(team = false) {
  const user = await currentUser();
  if (!user) redirect("/cliente/login");
  if (team && user.role !== "team") redirect("/cliente/acesso-negado");
  return user;
}
export async function createSession(userId: string, remember: boolean) {
  const token = randomToken();
  const seconds = remember ? 30 * 86400 : 12 * 3600;
  await query(
    `INSERT INTO portal_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+$3*interval '1 second')`,
    [tokenHash(token), userId, seconds],
  );
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: seconds } : {}),
  });
}
export async function logout() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token)
    await query("DELETE FROM portal_sessions WHERE token_hash=$1", [
      tokenHash(token),
    ]);
  store.delete(cookieName);
}

import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { hashPassword } from "../src/utils/portal/password.ts";

const command = process.argv[2];
if (!process.env.DATABASE_URL) {
  console.error("Configure DATABASE_URL no servidor ou em .env.local.");
  process.exit(1);
}
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
});
try {
  await client.connect();
  if (command === "inspect") {
    const result = await client.query(
      "SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema,table_name",
    );
    console.table(result.rows);
  } else if (command === "migrate") {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(673492)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS portal_migrations(version text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const exists = await client.query(
      "SELECT version FROM portal_migrations WHERE version='001-portal'",
    );
    if (!exists.rowCount) {
      const collisions = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() AND table_name=ANY($1::text[])",
        [
          [
            "portal_users",
            "clients",
            "client_users",
            "projects",
            "project_phases",
            "project_tasks",
            "project_requests",
          ],
        ],
      );
      if (collisions.rowCount)
        throw new Error(
          "Existing table names conflict; inspect and adapt the migration first",
        );
      await client.query(
        await readFile(
          new URL("../database/001-portal.sql", import.meta.url),
          "utf8",
        ),
      );
      await client.query(
        "INSERT INTO portal_migrations(version) VALUES('001-portal')",
      );
    }
    const reminders = await client.query(
      "SELECT version FROM portal_migrations WHERE version='002-notification-reminders'",
    );
    if (!reminders.rowCount) {
      await client.query(
        await readFile(
          new URL(
            "../database/002-notification-reminders.sql",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      await client.query(
        "INSERT INTO portal_migrations(version) VALUES('002-notification-reminders')",
      );
    }
    const itemHistory = await client.query(
      "SELECT version FROM portal_migrations WHERE version='003-delivery-item-history'",
    );
    if (!itemHistory.rowCount) {
      await client.query(
        await readFile(
          new URL("../database/003-delivery-item-history.sql", import.meta.url),
          "utf8",
        ),
      );
      await client.query(
        "INSERT INTO portal_migrations(version) VALUES('003-delivery-item-history')",
      );
    }
    await client.query("COMMIT");
    console.log("Migração aplicada.");
  } else if (command === "create-team") {
    const email = process.env.PORTAL_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.PORTAL_ADMIN_PASSWORD;
    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password ||
      password.length < 12 ||
      password.length > 128
    )
      throw new Error(
        "Configure PORTAL_ADMIN_EMAIL e PORTAL_ADMIN_PASSWORD (12–128 caracteres)",
      );
    await client.query(
      "INSERT INTO portal_users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,'team')",
      [
        randomUUID(),
        process.env.PORTAL_ADMIN_NAME || "Equipe D&G Studio",
        email,
        await hashPassword(password),
      ],
    );
    console.log(
      "Usuário da equipe criado. Remova PORTAL_ADMIN_PASSWORD do ambiente.",
    );
  } else if (command === "cleanup") {
    await client.query("DELETE FROM portal_sessions WHERE expires_at<now()");
    await client.query(
      "DELETE FROM portal_password_resets WHERE expires_at<now()",
    );
    await client.query("DELETE FROM portal_rate_limits WHERE expires_at<now()");
    console.log("Sessões, tokens e limites expirados removidos.");
  } else throw new Error("Use inspect, migrate, create-team ou cleanup");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(
    "Operação não concluída:",
    error.code ||
      (error.message.includes("Existing table")
        ? error.message
        : "Confira conexão, migração e variáveis de ambiente."),
  );
  process.exitCode = 1;
} finally {
  await client.end();
}

import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID, randomBytes } from "node:crypto";
import { Pool } from "pg";
import { existsSync } from "node:fs";
import { hashPassword, tokenHash } from "../src/utils/portal/password";
import { projectProgress, scheduleState } from "../src/config/portal";
import AxeBuilder from "@axe-core/playwright";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const userA = randomUUID(),
  userB = randomUUID(),
  team = randomUUID();
const clientA = randomUUID(),
  clientB = randomUUID();
const projectA = randomUUID(),
  projectA2 = randomUUID(),
  projectB = randomUUID();
const phase = randomUUID(),
  approval = randomUUID(),
  fileId = randomUUID();
const emailA = `portal-a-${userA}@example.com`,
  emailB = `portal-b-${userB}@example.com`,
  emailTeam = `portal-team-${team}@example.com`;
const password = randomBytes(20).toString("base64url");
let db: Pool;
const origin = "http://localhost:3000";
async function post(request: APIRequestContext, path: string, data: unknown) {
  return request.post(`/api/portal/${path}`, { headers: { origin }, data });
}
async function login(request: APIRequestContext, email: string) {
  const response = await post(request, "auth/login", {
    email,
    password,
    remember: true,
  });
  expect(response.status()).toBe(200);
}

test("progresso e prazo são calculados pelos dados", () => {
  expect(
    projectProgress([
      { status: "completed", total_tasks: 0, completed_tasks: 0 },
      { status: "in_progress", total_tasks: 3, completed_tasks: 1 },
    ]),
  ).toBe(50);
  expect(projectProgress([])).toBe(0);
  expect(scheduleState("2026-10-01", "in_progress", [], "2026-10-06")).toBe(
    "Atrasado",
  );
  expect(
    scheduleState(
      "2026-10-20",
      "in_progress",
      [{ status: "blocked" }],
      "2026-10-06",
    ),
  ).toBe("Atenção");
});

test.describe("portal conectado ao PostgreSQL", () => {
  test.skip(
    !process.env.DATABASE_URL,
    "Configure um PostgreSQL com as migrações do portal.",
  );
  test.beforeAll(async () => {
    db = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const hash = await hashPassword(password);
    for (const [id, name, email, role] of [
      [userA, "Cliente A", emailA, "client"],
      [userB, "Cliente B", emailB, "client"],
      [team, "Equipe de Teste", emailTeam, "team"],
    ])
      await db.query(
        "INSERT INTO portal_users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)",
        [id, name, email, hash, role],
      );
    for (const [id, name] of [
      [clientA, "Cliente de teste A"],
      [clientB, "Cliente de teste B"],
    ])
      await db.query("INSERT INTO clients(id,name) VALUES($1,$2)", [id, name]);
    await db.query(
      "INSERT INTO client_users(client_id,user_id,can_view_finance) VALUES($1,$2,false),($3,$4,true)",
      [clientA, userA, clientB, userB],
    );
    for (const [id, client, name] of [
      [projectA, clientA, "Projeto de teste A"],
      [projectA2, clientA, "Segundo projeto A"],
      [projectB, clientB, "Projeto privado B"],
    ])
      await db.query(
        "INSERT INTO projects(id,client_id,name,status,due_on) VALUES($1,$2,$3,'in_progress','2026-12-20')",
        [id, client, name],
      );
    await db.query(
      "INSERT INTO project_phases(id,project_id,title,status,owner) VALUES($1,$2,'Desenvolvimento','in_progress','Equipe D&G')",
      [phase, projectA],
    );
    await db.query(
      "INSERT INTO project_tasks(id,project_id,phase_id,title,status) VALUES($1,$2,$3,'Estrutura inicial','completed'),($4,$2,$3,'Área do cliente','pending')",
      [randomUUID(), projectA, phase, randomUUID()],
    );
    await db.query(
      "INSERT INTO project_approvals(id,project_id,title,version) VALUES($1,$2,'Layout de teste','v1')",
      [approval, projectA],
    );
    await db.query(
      "INSERT INTO project_files(id,project_id,author_id,name,mime,size,category,content) VALUES($1,$2,$3,'arquivo-privado.txt','text/plain',7,'Documentos',$4)",
      [fileId, projectB, userB, Buffer.from("privado")],
    );
    await db.query(
      "INSERT INTO project_payments(id,project_id,title,amount_cents,due_on) VALUES($1,$2,'Parcela privada',100000,'2026-12-01')",
      [randomUUID(), projectB],
    );
  });
  test.afterAll(async () => {
    if (!db) return;
    await db.query("DELETE FROM projects WHERE id=ANY($1::uuid[])", [
      [projectA, projectA2, projectB],
    ]);
    await db.query("DELETE FROM clients WHERE id=ANY($1::uuid[])", [
      [clientA, clientB],
    ]);
    await db.query("DELETE FROM portal_users WHERE id=ANY($1::uuid[])", [
      [userA, userB, team],
    ]);
    await db.query("DELETE FROM portal_rate_limits WHERE key=ANY($1::text[])", [
      [
        ...[emailA, emailB, emailTeam].map((email) =>
          tokenHash(`login:${email}`),
        ),
        tokenHash(`mutation:${userA}`),
        tokenHash(`admin:${team}`),
        tokenHash(`mutation:${team}`),
        tokenHash(`upload:${userA}`),
        tokenHash(`reset-token:${resetToken}`),
      ],
    ]);
    await db.end();
  });
  test("rotas exigem sessão e rejeitam origem externa", async ({
    page,
    request,
  }) => {
    for (const section of [
      "dashboard",
      "projeto",
      "cronograma",
      "etapas",
      "entregas",
      "aprovacoes",
      "solicitacoes",
      "arquivos",
      "mensagens",
      "financeiro",
      "perfil",
      "suporte",
    ]) {
      await page.goto(`/cliente/${section}`);
      await expect(page).toHaveURL(/\/cliente\/login$/);
    }
    expect(
      (await post(request, "request", { projectId: projectA })).status(),
    ).toBe(401);
    expect(
      (
        await request.post("/api/portal/auth/login", {
          headers: { origin: "https://example.com" },
          data: { email: emailA, password },
        })
      ).status(),
    ).toBe(403);
    await page.goto("/cliente/login");
    await page
      .getByRole("button", { name: "Mostrar senha", exact: true })
      .click();
    await expect(page.locator("#portal-password")).toHaveAttribute(
      "type",
      "text",
    );
  });
  test("login, multiprojetos, progresso, mobile e acessibilidade", async ({
    page,
  }) => {
    await page.goto("/cliente/login");
    await page.getByLabel("E-mail", { exact: false }).fill(emailA);
    await page.locator("#portal-password").fill(password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/cliente\/dashboard$/);
    await page.goto(`/cliente/dashboard?projeto=${projectA}`);
    await expect(
      page.getByRole("heading", { name: "Olá, Cliente" }),
    ).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    await expect(page.getByLabel("Projeto atual")).toHaveCount(1);
    await page.getByLabel("Projeto atual").selectOption(projectA2);
    await expect(page).toHaveURL(new RegExp(projectA2));
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await page.goto(`/cliente/dashboard?projeto=${projectA}`);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
      ).toBe(false);
      if (width === 390) {
        await page
          .getByRole("button", { name: "Abrir menu do portal" })
          .click();
        await expect(
          page.getByRole("dialog", { name: "Menu do portal" }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
      }
      if (width === 390 || width === 1440) {
        await page.screenshot({
          path: `test-results/portal-${width}.png`,
          fullPage: true,
        });
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
          .analyze();
        expect(result.violations).toEqual([]);
      }
    }
    if ((await page.locator("html").getAttribute("data-theme")) !== "dark")
      await page
        .getByRole("button", { name: "Ativar modo escuro", exact: true })
        .click();
    await page.screenshot({
      path: "test-results/portal-dark.png",
      fullPage: true,
    });
    const darkResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
      .analyze();
    expect(darkResults.violations).toEqual([]);
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page).toHaveURL(/\/cliente\/login$/);
    await page.goto("/cliente/dashboard");
    await expect(page).toHaveURL(/\/cliente\/login$/);
  });
  test("cliente não lê nem altera projetos, arquivos ou financeiro de outro cliente", async ({
    request,
  }) => {
    await login(request, emailA);
    expect(
      (
        await post(request, "request", {
          projectId: projectB,
          title: "Tentativa",
          category: "Bug",
          client_priority: "Normal",
          description: "Tentativa de outro cliente",
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await post(request, "approval", {
          projectId: projectB,
          id: approval,
          decision: "approved",
          comment: "",
        })
      ).status(),
    ).toBe(403);
    expect((await request.get(`/api/portal/files/${fileId}`)).status()).toBe(
      403,
    );
    expect(
      (await request.get(`/api/portal/alerts?project=${projectB}`)).status(),
    ).toBe(403);
    const foreign = await request.get(`/cliente/projeto?projeto=${projectB}`);
    expect(await foreign.text()).not.toContain("Projeto privado B");
    const finance = await request.get(
      `/cliente/financeiro?projeto=${projectA}`,
    );
    expect(await finance.text()).toContain("Acesso não permitido");
    expect(
      (
        await post(request, "admin", {
          action: "client",
          data: { name: "Não autorizado" },
        })
      ).status(),
    ).toBe(403);
  });
  test("aprovação tem auditoria e não pode ser sobrescrita", async ({
    request,
  }) => {
    await login(request, emailA);
    const result = await post(request, "approval", {
      projectId: projectA,
      id: approval,
      decision: "approved",
      comment: "Conferido e aprovado",
    });
    expect(result.status()).toBe(200);
    expect(
      (
        await post(request, "approval", {
          projectId: projectA,
          id: approval,
          decision: "revision_requested",
          comment: "Tentativa de sobrescrever",
        })
      ).status(),
    ).toBe(409);
    const row = (
      await db.query(
        "SELECT decided_by,decided_at,status,comment FROM project_approvals WHERE id=$1",
        [approval],
      )
    ).rows[0];
    expect(row.decided_by).toBe(userA);
    expect(row.decided_at).toBeTruthy();
    expect(row.comment).toBe("Conferido e aprovado");
    expect(
      (
        await db.query(
          "SELECT id FROM project_activity_log WHERE entity_id=$1 AND action='CLIENT_APPROVED_DELIVERY'",
          [approval],
        )
      ).rowCount,
    ).toBe(1);
  });
  test("solicitações, comentários, anexos e notificações persistem", async ({
    request,
  }) => {
    await login(request, emailA);
    const created = await post(request, "request", {
      projectId: projectA,
      title: "Ajustar chamada",
      category: "Conteúdo",
      module: "Home",
      client_priority: "Normal",
      description: "Precisamos atualizar a chamada da página.",
    });
    expect(created.status()).toBe(201);
    const { id } = await created.json();
    expect(
      (
        await post(request, "comment", {
          projectId: projectA,
          requestId: id,
          message: "Mais detalhes sobre a alteração.",
        })
      ).status(),
    ).toBe(201);
    const upload = await request.post("/api/portal/files", {
      headers: { origin },
      multipart: {
        projectId: projectA,
        requestId: id,
        category: "Conteúdo",
        file: {
          name: "orientacoes.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("Orientações do cliente"),
        },
      },
    });
    expect(upload.status()).toBe(201);
    const file = await upload.json();
    expect((await request.get(`/api/portal/files/${file.id}`)).status()).toBe(
      200,
    );
    const invalid = await request.post("/api/portal/files", {
      headers: { origin },
      multipart: {
        projectId: projectA,
        category: "Outros",
        file: {
          name: "ataque.html",
          mimeType: "text/html",
          buffer: Buffer.from("<script>alert(1)</script>"),
        },
      },
    });
    expect(invalid.status()).toBe(400);
    await login(request, emailTeam);
    expect(
      (
        await post(request, "message", {
          projectId: projectA,
          message: "Atualização publicada pela equipe.",
        })
      ).status(),
    ).toBe(201);
    await login(request, emailA);
    const alerts = await request.get(`/api/portal/alerts?project=${projectA}`);
    const result = await alerts.json();
    expect(result.unread).toBeGreaterThan(0);
    expect(
      (await post(request, "notifications", { projectId: projectA })).status(),
    ).toBe(200);
    expect(
      (
        await (
          await request.get(`/api/portal/alerts?project=${projectA}`)
        ).json()
      ).unread,
    ).toBe(0);
  });
  test("administração publica entrega e aprovação automaticamente", async ({
    request,
  }) => {
    await login(request, emailTeam);
    const response = await post(request, "admin", {
      action: "entity",
      entity: "deliveries",
      projectId: projectA,
      data: {
        title: "Entrega de teste",
        version: "0.1",
        description: "Uma versão para homologação",
        url: "https://example.com/preview",
      },
    });
    expect(response.status()).toBe(200);
    const { id } = await response.json();
    expect(
      (
        await db.query(
          "SELECT id FROM project_approvals WHERE project_id=$1 AND delivery_id=$2",
          [projectA, id],
        )
      ).rowCount,
    ).toBe(1);
    expect(
      (
        await post(request, "admin", {
          action: "entity",
          entity: "tasks",
          projectId: projectB,
          data: {
            title: "Tentativa cruzada",
            phase_id: phase,
            status: "pending",
          },
        })
      ).status(),
    ).toBe(400);
  });
  test("todas as telas renderizam dados reais e ações de formulário funcionam", async ({
    page,
  }) => {
    await login(page.request, emailA);
    for (const section of [
      "projeto",
      "cronograma",
      "etapas",
      "entregas",
      "aprovacoes",
      "solicitacoes",
      "arquivos",
      "mensagens",
      "suporte",
      "perfil",
      "atualizacoes",
    ]) {
      await page.goto(`/cliente/${section}?projeto=${projectA}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(
        page.getByText("Sua área está temporariamente indisponível"),
      ).toHaveCount(0);
    }
    await page.goto(`/cliente/solicitacoes?projeto=${projectA}`);
    await page
      .getByRole("button", { name: "Solicitar alteração", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("Título", { exact: false })
      .fill("Solicitação pela interface");
    await dialog
      .getByLabel("Descrição", { exact: false })
      .fill("Uma alteração enviada pelo formulário do portal.");
    await dialog
      .getByRole("button", { name: "Enviar solicitação", exact: true })
      .click();
    await expect(page).toHaveURL(/item=/);
    await expect(
      page.getByRole("heading", { name: "Solicitação pela interface" }),
    ).toBeVisible();
    await page
      .getByLabel("Adicionar comentário", { exact: false })
      .fill("Comentário enviado pela interface.");
    await page
      .getByRole("button", { name: "Enviar mensagem", exact: true })
      .click();
    await expect(
      page.getByText("Comentário enviado pela interface.", { exact: true }),
    ).toBeVisible();
    await login(page.request, emailB);
    await page.goto(`/cliente/financeiro?projeto=${projectB}`);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(
      page.getByText("Parcela privada", { exact: true }),
    ).toBeVisible();
    await login(page.request, emailTeam);
    await page.goto(`/equipe?projeto=${projectA}`);
    await expect(
      page.getByRole("heading", { name: "Administração do portal" }),
    ).toBeVisible();
    await expect(
      page.getByText("Sua área está temporariamente indisponível"),
    ).toHaveCount(0);
    for (const type of [
      "tasks",
      "milestones",
      "members",
      "deliveries",
      "delivery_items",
      "approvals",
      "updates",
      "payments",
      "requests",
    ]) {
      await page.goto(`/equipe?projeto=${projectA}&tipo=${type}`);
      await expect(
        page.getByRole("heading", { name: "Administração do portal" }),
      ).toBeVisible();
      await expect(
        page.getByText("Sua área está temporariamente indisponível"),
      ).toHaveCount(0);
    }
  });
  test("financeiro mantém totais ao paginar e lembretes não duplicam", async ({
    page,
  }) => {
    for (let index = 0; index < 21; index++)
      await db.query(
        "INSERT INTO project_payments(id,project_id,title,amount_cents,due_on) VALUES($1,$2,$3,1000,current_date+2)",
        [randomUUID(), projectB, `Parcela adicional ${index + 1}`],
      );
    await login(page.request, emailB);
    await page.goto(`/cliente/financeiro?projeto=${projectB}`);
    const summary = page
      .getByRole("heading", { name: "Resumo financeiro", exact: true })
      .locator("..");
    await expect(summary).toContainText("1.210,00");
    await page.getByRole("link", { name: "Próxima", exact: true }).click();
    await expect(page).toHaveURL(/pagina=2/);
    await expect(
      page
        .getByRole("heading", { name: "Resumo financeiro", exact: true })
        .locator(".."),
    ).toContainText("1.210,00");
    expect(
      (
        await page.request.get(`/api/portal/alerts?project=${projectB}`)
      ).status(),
    ).toBe(200);
    expect(
      (
        await page.request.get(`/api/portal/alerts?project=${projectB}`)
      ).status(),
    ).toBe(200);
    const count = (
      await db.query(
        "SELECT count(*)::integer total FROM project_notifications WHERE project_id=$1 AND user_id=$2 AND dedupe_key IS NOT NULL",
        [projectB, userB],
      )
    ).rows[0];
    expect(count.total).toBe(21);
  });
  const resetToken = randomBytes(32).toString("hex");
  test("recuperação é de uso único e revoga sessões anteriores", async ({
    request,
  }) => {
    await login(request, emailB);
    await db.query(
      "INSERT INTO portal_password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')",
      [tokenHash(resetToken), userB],
    );
    const reset = await post(request, "auth/reset", {
      token: resetToken,
      password: "NovaSenhaDeTeste123!",
    });
    expect(reset.status()).toBe(200);
    expect(
      (
        await post(request, "auth/reset", {
          token: resetToken,
          password: "OutraSenhaDeTeste123!",
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await post(request, "message", {
          projectId: projectB,
          message: "Sessão antiga",
        })
      ).status(),
    ).toBe(401);
  });
});

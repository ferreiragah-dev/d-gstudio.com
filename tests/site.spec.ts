import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("responsividade, conteúdo e console nas larguras solicitadas", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page).toHaveTitle(
    "D&G Studio | Sites, Sistemas e Experiências Digitais",
  );
  await expect(page.locator("h1")).toHaveText(
    "Criamos experiências digitais para pessoas e empresas.",
  );
  await expect(page.locator(".service-card")).toHaveCount(8);
  await expect(page.locator(".project-card")).toHaveCount(4);
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, `Overflow horizontal em ${width}px`).toBe(false);
    expect(
      await page
        .locator(".phone-copy")
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
      `Texto do smartphone em ${width}px`,
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Enviar solicitação", exact: true }),
    ).toBeVisible();
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `test-results/site-${width}.png`,
        fullPage: true,
      });
  }
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href")!)
        .filter((href) => !document.getElementById(href.slice(1))),
    );
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
});

test("menu mobile, navegação e projeto acessível por teclado", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: /Abrir menu|Fechar menu/ });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Serviços", exact: true })
    .click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#servicos$/);
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page
    .getByRole("button", {
      name: "Ver projeto: Site Institucional",
      exact: true,
    })
    .click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("Não representa um cliente");
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  await page
    .getByRole("button", { name: "Ver projeto: E-commerce", exact: true })
    .click();
  await page.getByRole("link", { name: "Quero um projeto assim" }).click();
  await expect(page.getByLabel("Tipo de projeto")).toHaveValue("E-commerce");
});

test("formulário valida, preserva dados em falha e gera resumo sem falso envio", async ({
  page,
}) => {
  await page.goto("/?tipo=Site&plano=Profissional#orcamento");
  await expect(page.getByLabel("Tipo de projeto")).toHaveValue("Site");
  await page
    .getByRole("button", { name: "Enviar solicitação", exact: true })
    .click();
  await expect(page.getByLabel("Nome", { exact: false }).first()).toBeFocused();
  await expect(
    page.getByText("Informe seu nome, com pelo menos 2 caracteres."),
  ).toBeVisible();
  await page
    .getByLabel("Nome", { exact: false })
    .first()
    .fill("Pessoa de Teste");
  await page.getByLabel("E-mail", { exact: false }).fill("teste@example.com");
  await page.getByLabel("WhatsApp", { exact: false }).fill("11999999999");
  await page
    .getByLabel("Objetivo do projeto")
    .fill("Apresentar os serviços de uma empresa");
  await page.getByLabel("Possui site atualmente?").selectOption("Não");
  await page.getByLabel("Prazo desejado").selectOption("Ainda não defini");
  await page
    .getByLabel("Faixa de investimento")
    .selectOption("Quero conversar primeiro");
  await page
    .getByLabel("Descrição detalhada do projeto")
    .fill(
      "Um site institucional responsivo com apresentação de serviços e contato.",
    );
  await page.getByRole("checkbox").check();
  await page.route("**/api/quote", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ message: "Falha temporária de teste." }),
    }),
  );
  await page
    .getByRole("button", { name: "Enviar solicitação", exact: true })
    .click();
  await expect(page.getByRole("form").getByRole("alert")).toContainText(
    "Falha temporária",
  );
  await expect(page.getByLabel("Descrição detalhada do projeto")).toHaveValue(
    /institucional/,
  );
  await page.unroute("**/api/quote");
  await page
    .getByRole("button", { name: "Enviar solicitação", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "seus dados não foram enviados",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Baixar resumo do projeto" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "dg-studio-meu-projeto.txt",
  );
});

test("API rejeita origem externa e dados inválidos", async ({ request }) => {
  const foreign = await request.post("/api/quote", {
    headers: { origin: "https://example.com" },
    data: {},
  });
  expect(foreign.status()).toBe(403);
  const invalid = await request.post("/api/quote", {
    headers: { origin: "http://localhost:3000" },
    data: { name: "A" },
  });
  expect(invalid.status()).toBe(400);
  const tooLarge = await request.post("/api/quote", {
    headers: { origin: "http://localhost:3000" },
    data: { description: "a".repeat(21000) },
  });
  expect(tooLarge.status()).toBe(413);
});

test("acessibilidade automática desktop, mobile e formulário", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test("SEO, privacidade e 404", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  expect(
    await page.locator('script[type="application/ld+json"]').textContent(),
  ).toContain('"name":"D&G Studio"');
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/opengraph-image")).status()).toBe(200);
  await page
    .getByRole("link", { name: "Privacidade", exact: true })
    .last()
    .click();
  await expect(page.locator("h1")).toHaveText("Privacidade");
  expect((await page.goto("/pagina-inexistente"))?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: "Conheça a D&G Studio" }),
  ).toBeVisible();
});

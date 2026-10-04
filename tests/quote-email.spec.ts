import { test, expect } from "@playwright/test";
import nodemailer from "nodemailer";
import { buildQuoteEmail } from "../src/utils/quote-email";
import { deliverQuote } from "../src/utils/quote-delivery";
import type { QuoteData } from "../src/utils/quote-schema";

const data: QuoteData = {
  name: "Pessoa <Teste>",
  company: "Empresa & Cia",
  email: "teste@example.com",
  whatsapp: "11999999999",
  projectType: "Site",
  objective: "Apresentar serviços da empresa",
  existingSite: "Não",
  deadline: "Ainda não defini",
  budget: "Quero conversar primeiro",
  description: '<script>alert("teste")</script>\nDetalhes do projeto.',
  consent: true,
  plan: "Profissional",
  website: "",
};

test("template inclui dados, resposta ao visitante e escapa HTML", () => {
  const email = buildQuoteEmail(data, "2026-10-04T15:00:00Z");
  expect(email.to).toEqual(["comercial@degstudio.com.br"]);
  expect(email.reply_to).toBe(data.email);
  expect(email.html).not.toContain("<script>");
  expect(email.html).toContain("&lt;script&gt;");
  for (const value of [
    data.name,
    data.company,
    data.email,
    data.whatsapp,
    data.projectType,
    data.objective,
    data.deadline,
    data.budget,
    data.description,
    data.plan,
  ]) {
    expect(email.text).toContain(value);
  }
});

test("SMTP só confirma sucesso quando aceita o destinatário", async () => {
  const previousUser = process.env.SMTP_USER;
  const previousPassword = process.env.SMTP_PASSWORD;
  const original = nodemailer.createTransport;
  process.env.SMTP_USER = "comercial@degstudio.com.br";
  process.env.SMTP_PASSWORD = "test-only";
  let accepted = ["comercial@degstudio.com.br"];
  let message: Record<string, unknown> = {};
  nodemailer.createTransport = (() => ({
    sendMail: async (value: Record<string, unknown>) => {
      message = value;
      return { accepted };
    },
    close: () => {},
  })) as unknown as typeof original;
  try {
    expect((await deliverQuote(data)).status).toBe("sent");
    expect(message.replyTo).toBe(data.email);
    expect(message.to).toEqual(["comercial@degstudio.com.br"]);
    accepted = [];
    await expect(deliverQuote(data)).rejects.toThrow("Quote email rejected");
  } finally {
    nodemailer.createTransport = original;
    if (previousUser === undefined) delete process.env.SMTP_USER;
    else process.env.SMTP_USER = previousUser;
    if (previousPassword === undefined) delete process.env.SMTP_PASSWORD;
    else process.env.SMTP_PASSWORD = previousPassword;
  }
});

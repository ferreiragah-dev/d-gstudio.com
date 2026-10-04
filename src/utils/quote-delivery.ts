import type { QuoteData, QuoteResult } from "./quote-schema";
import nodemailer from "nodemailer";
import { buildQuoteEmail, quoteRecipient } from "./quote-email";

export async function deliverQuote(data: QuoteData): Promise<QuoteResult> {
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    const port = Number(process.env.SMTP_PORT || 465);
    if (![465, 587].includes(port)) throw new Error("Invalid SMTP port");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    const { reply_to, ...email } = buildQuoteEmail(
      data,
      new Date().toISOString(),
    );
    try {
      const result = await transport.sendMail({
        ...email,
        replyTo: reply_to,
        from: { name: "D&G Studio", address: process.env.SMTP_USER },
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      if (
        !result.accepted.some(
          (address: string | { address: string }) =>
            (typeof address === "string"
              ? address
              : address.address
            ).toLowerCase() === quoteRecipient,
        )
      )
        throw new Error("Quote email rejected");
    } finally {
      transport.close();
    }
    return {
      status: "sent",
      message:
        "Solicitação enviada! Vamos analisar sua ideia e entrar em contato pelos dados informados.",
    };
  }
  const endpoint = process.env.QUOTE_WEBHOOK_URL;
  // Mock explícito: sem persistência, logs de dados pessoais ou confirmação falsa.
  if (!endpoint)
    return {
      status: "draft",
      message:
        "Seu resumo está pronto. O envio direto ainda não está disponível e seus dados não foram enviados à D&G Studio. Baixe o resumo para guardar sua ideia.",
    };
  if (new URL(endpoint).protocol !== "https:")
    throw new Error("Invalid endpoint configuration");
  const { website: _honeypot, ...quote } = data;
  void _honeypot;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.QUOTE_WEBHOOK_TOKEN
        ? { Authorization: `Bearer ${process.env.QUOTE_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      source: "dg-studio",
      submittedAt: new Date().toISOString(),
      quote,
    }),
    signal: AbortSignal.timeout(12000),
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Quote delivery failed");
  return {
    status: "sent",
    message:
      "Solicitação enviada! Vamos analisar sua ideia e entrar em contato pelos dados informados.",
  };
}

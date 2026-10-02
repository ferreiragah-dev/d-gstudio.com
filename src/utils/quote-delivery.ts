import type { QuoteData, QuoteResult } from "./quote-schema";

export async function deliverQuote(data: QuoteData): Promise<QuoteResult> {
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

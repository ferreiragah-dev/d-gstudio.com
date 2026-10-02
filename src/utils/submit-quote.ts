import type { QuoteData, QuoteResult } from "./quote-schema";

// Fronteira única do cliente: troque o adaptador no servidor sem alterar o formulário.
export async function submitQuote(data: QuoteData): Promise<QuoteResult> {
  const response = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.message ?? "Não foi possível enviar. Tente novamente.",
    );
  return result;
}

export function downloadQuote(data: QuoteData) {
  const lines = [
    "D&G STUDIO — RESUMO DO PROJETO",
    "Rascunho local. Este arquivo não confirma envio ou recebimento.",
    "",
    `Nome: ${data.name}`,
    `Empresa: ${data.company || "Não informada"}`,
    `E-mail: ${data.email}`,
    `WhatsApp: ${data.whatsapp}`,
    `Tipo: ${data.projectType}`,
    ...(data.plan ? [`Categoria: ${data.plan}`] : []),
    `Objetivo: ${data.objective}`,
    `Possui site: ${data.existingSite}`,
    `Prazo: ${data.deadline}`,
    `Investimento: ${data.budget}`,
    "",
    "Descrição:",
    data.description,
  ];
  const url = URL.createObjectURL(
    new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "dg-studio-meu-projeto.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

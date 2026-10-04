import type { QuoteData } from "./quote-schema";

export const quoteRecipient = "comercial@degstudio.com.br";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}

export function buildQuoteEmail(data: QuoteData, submittedAt: string) {
  const fields = [
    ["Nome", data.name],
    ["Empresa", data.company || "Não informada"],
    ["E-mail", data.email],
    ["WhatsApp", data.whatsapp],
    ["Tipo de projeto", data.projectType],
    ["Plano", data.plan || "Não selecionado"],
    ["Objetivo", data.objective],
    ["Possui site atualmente?", data.existingSite],
    ["Prazo desejado", data.deadline],
    ["Faixa de investimento", data.budget],
    ["Descrição do projeto", data.description],
    ["Autorização de contato", "Sim"],
    [
      "Recebido em",
      new Date(submittedAt).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }) + " (Brasília)",
    ],
  ];
  const subject = `Novo orçamento • ${data.projectType} • ${data.name}`.replace(
    /[\r\n]/g,
    " ",
  );
  const text = [
    "D&G STUDIO — NOVA SOLICITAÇÃO DE ORÇAMENTO",
    "",
    ...fields.map(([label, value]) => `${label}: ${value}`),
    "",
    "Responda a este e-mail para conversar diretamente com o solicitante.",
  ].join("\n");
  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top" style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#5b6475;width:32%">${escapeHtml(label)}</th><td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nova solicitação de orçamento</title></head><body style="margin:0;background:#f3f4f6;color:#172033;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden"><tr><td style="padding:32px;background:#080b16;color:#ffffff"><p style="margin:0 0 16px;color:#a5b4fc;font-size:13px;letter-spacing:2px">D&amp;G STUDIO</p><h1 style="margin:0;font-size:26px">Nova solicitação de orçamento</h1><p style="margin:12px 0 0;color:#d1d5db">Uma nova ideia chegou pelo formulário do site.</p></td></tr><tr><td style="padding:16px"><table width="100%" cellspacing="0" cellpadding="0">${rows}</table></td></tr><tr><td style="padding:16px 32px 32px"><a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;background:#4338ca;color:#ffffff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Responder ao solicitante</a><p style="font-size:12px;color:#5b6475;margin:20px 0 0">Enviado pelo site da D&amp;G Studio. Você também pode usar a opção Responder do seu e-mail.</p></td></tr></table></td></tr></table></body></html>`;
  return { to: [quoteRecipient], reply_to: data.email, subject, html, text };
}

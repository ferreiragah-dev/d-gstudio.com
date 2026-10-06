import "server-only";
import nodemailer from "nodemailer";

export async function sendResetMail(email: string, token: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (
    !site ||
    new URL(site).protocol !== "https:" ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  )
    throw new Error("Reset mail unavailable");
  const port = Number(process.env.SMTP_PORT || 465);
  if (![465, 587].includes(port)) throw new Error("Invalid SMTP port");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 5000,
    socketTimeout: 10000,
  });
  const url = `${site.replace(/\/$/, "")}/cliente/redefinir-senha#token=${token}`;
  try {
    const result = await transport.sendMail({
      from: { name: "D&G Studio", address: process.env.SMTP_USER },
      to: email,
      subject: "Redefina sua senha • Portal D&G Studio",
      text: `Você solicitou uma nova senha para o Portal D&G Studio.\n\nAcesse: ${url}\n\nO link expira em 30 minutos e pode ser usado uma única vez. Se não fez esta solicitação, ignore esta mensagem.`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (!result.accepted.length) throw new Error("Reset mail rejected");
  } finally {
    transport.close();
  }
}

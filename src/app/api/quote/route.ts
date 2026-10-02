import { NextRequest, NextResponse } from "next/server";
import { quoteSchema } from "@/utils/quote-schema";
import { deliverQuote } from "@/utils/quote-delivery";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    sameOrigin = siteConfig.url
      ? origin.origin === new URL(siteConfig.url).origin
      : ["http:", "https:"].includes(origin.protocol) &&
        origin.host === request.headers.get("host");
  } catch {
    /* Origem ausente ou inválida: rejeitar. */
  }
  if (!sameOrigin)
    return NextResponse.json(
      { message: "Origem da solicitação não permitida." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ message: "Formato inválido." }, { status: 415 });
  if (Number(request.headers.get("content-length")) > 20000)
    return NextResponse.json(
      { message: "Solicitação muito grande." },
      { status: 413 },
    );
  let body;
  try {
    // Limite efetivo também em requisições sem Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty body");
    let length = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 20000) {
        await reader.cancel();
        return NextResponse.json(
          { message: "Solicitação muito grande." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    return NextResponse.json(
      { message: "Dados inválidos. Revise o formulário." },
      { status: 400 },
    );
  }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        message: "Revise os campos do formulário.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  try {
    return NextResponse.json(await deliverQuote(parsed.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Não foi possível enviar agora. Seus dados continuam no formulário. Tente novamente em instantes.",
      },
      { status: 502 },
    );
  }
}

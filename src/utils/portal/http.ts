import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class PortalError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const origin = new URL(request.headers.get("origin") || "");
    const permitted = expected
      ? origin.origin === new URL(expected).origin
      : ["http:", "https:"].includes(origin.protocol) &&
        origin.host === request.headers.get("host");
    if (!permitted) throw new Error();
  } catch {
    throw new PortalError("Origem da solicitação não permitida.", 403);
  }
}
export async function readJson(request: Request) {
  sameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new PortalError("Formato inválido.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new PortalError("Dados ausentes.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 24000) {
      await reader.cancel();
      throw new PortalError("Solicitação muito grande.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new PortalError("Revise os dados enviados.");
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function portalFailure(error: unknown) {
  if (error instanceof PortalError)
    return json({ message: error.message }, error.status);
  if (error instanceof ZodError)
    return json(
      {
        message: error.issues[0]?.message || "Revise os campos.",
        errors: error.flatten().fieldErrors,
      },
      400,
    );
  console.error(
    "Portal operation failed",
    error instanceof Error && "code" in error
      ? String(error.code)
      : "unavailable",
  );
  return json(
    {
      message: "Não foi possível concluir agora. Tente novamente em instantes.",
    },
    503,
  );
}

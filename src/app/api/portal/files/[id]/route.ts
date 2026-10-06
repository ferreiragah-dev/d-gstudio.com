import { requireUser } from "@/utils/portal/auth";
import { accessProject } from "@/utils/portal/projects";
import { query } from "@/utils/portal/db";
import { portalFailure, PortalError } from "@/utils/portal/http";
import { uuid } from "@/utils/portal/validation";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const id = uuid.parse((await context.params).id);
    const metadata = (
      await query<{ project_id: string }>(
        "SELECT project_id FROM project_files WHERE id=$1",
        [id],
      )
    )[0];
    if (!metadata) throw new PortalError("Arquivo não encontrado.", 404);
    await accessProject(user, metadata.project_id);
    const file = (
      await query<{ content: Buffer; mime: string; name: string }>(
        "SELECT content,mime,name FROM project_files WHERE id=$1",
        [id],
      )
    )[0];
    const inline =
      new URL(request.url).searchParams.get("view") === "1" &&
      ["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(
        file.mime,
      );
    return new Response(new Uint8Array(file.content), {
      headers: {
        "Content-Type": file.mime,
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy":
          "sandbox; default-src 'none'; style-src 'unsafe-inline'",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch (error) {
    return portalFailure(error);
  }
}

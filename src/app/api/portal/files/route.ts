import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireUser, rateLimit } from "@/utils/portal/auth";
import { accessProject } from "@/utils/portal/projects";
import { query, transaction } from "@/utils/portal/db";
import {
  json,
  portalFailure,
  PortalError,
  sameOrigin,
} from "@/utils/portal/http";
import { uuid } from "@/utils/portal/validation";
import { fileCategories } from "@/config/portal";
import { validateFile } from "@/utils/portal/files";
import { audit, notify } from "@/utils/portal/activity";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    await rateLimit(`upload:${user.id}`, 20, 3600);
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
      throw new PortalError("Formato inválido.", 415);
    // Bound the stream before multipart parsing, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new PortalError("Arquivo ausente.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 5 * 1024 * 1024 + 24000) {
        await reader.cancel();
        throw new PortalError("O arquivo deve ter até 5 MB.", 413);
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
    const projectId = uuid.parse(form.get("projectId"));
    const category = z.enum(fileCategories).parse(form.get("category"));
    const requestId = form.get("requestId")
      ? uuid.parse(form.get("requestId"))
      : null;
    const messageId = form.get("messageId")
      ? uuid.parse(form.get("messageId"))
      : null;
    const file = form.get("file");
    if (!(file instanceof File)) throw new PortalError("Selecione um arquivo.");
    const content = Buffer.from(await file.arrayBuffer());
    const validated = validateFile(file.name, content);
    const id = randomUUID();
    await transaction(async (client) => {
      await accessProject(user, projectId, false, client);
      await query(
        "SELECT id FROM projects WHERE id=$1 FOR UPDATE",
        [projectId],
        client,
      );
      const usage = (
        await query<{ size: string }>(
          "SELECT coalesce(sum(size),0)::text size FROM project_files WHERE project_id=$1",
          [projectId],
          client,
        )
      )[0];
      if (Number(usage.size) + file.size > 100 * 1024 * 1024)
        throw new PortalError(
          "Este projeto atingiu o limite de arquivos. Fale com nossa equipe.",
        );
      if (
        requestId &&
        !(
          await query(
            "SELECT id FROM project_requests WHERE id=$1 AND project_id=$2",
            [requestId, projectId],
            client,
          )
        ).length
      )
        throw new PortalError("Solicitação não encontrada.", 404);
      if (
        messageId &&
        !(
          await query(
            "SELECT id FROM project_messages WHERE id=$1 AND project_id=$2",
            [messageId, projectId],
            client,
          )
        ).length
      )
        throw new PortalError("Mensagem não encontrada.", 404);
      await query(
        "INSERT INTO project_files(id,project_id,request_id,message_id,author_id,name,mime,size,category,content) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          id,
          projectId,
          requestId,
          messageId,
          user.id,
          validated.name,
          validated.mime,
          file.size,
          category,
          content,
        ],
        client,
      );
      await audit(client, projectId, user, "FILE_UPLOADED", "file", id);
      await notify(client, projectId, user, "Novo arquivo enviado", "arquivos");
    });
    return json({ message: "Arquivo enviado.", id }, 201);
  } catch (error) {
    return portalFailure(error);
  }
}

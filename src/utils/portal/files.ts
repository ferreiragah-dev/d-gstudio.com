import "server-only";
import { PortalError } from "./http";
const fileTypes: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};
export function validateFile(name: string, content: Buffer) {
  const extension = name.toLowerCase().split(".").pop() || "";
  const mime = fileTypes[extension];
  if (!mime || !content.length || content.length > 5 * 1024 * 1024)
    throw new PortalError(
      "Envie PDF, PNG, JPG, TXT, DOCX, XLSX ou ZIP de até 5 MB.",
    );
  const valid =
    extension === "pdf"
      ? content.subarray(0, 5).toString() === "%PDF-"
      : extension === "png"
        ? content
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : ["jpg", "jpeg"].includes(extension)
          ? content[0] === 255 && content[1] === 216 && content[2] === 255
          : ["zip", "docx", "xlsx"].includes(extension)
            ? content[0] === 80 && content[1] === 75
            : !content.includes(0);
  if (!valid)
    throw new PortalError("O conteúdo não corresponde ao tipo do arquivo.");
  return { mime, name: name.replace(/[\r\n\x00-\x1f/\\]/g, "_").slice(0, 200) };
}

export async function portalPost(path: string, body: unknown) {
  const response = await fetch(`/api/portal/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Não foi possível concluir agora.");
  window.dispatchEvent(new Event("dg-portal-change"));
  return result as { message?: string; redirect?: string; id?: string };
}
export async function uploadPortalFile(
  file: File,
  projectId: string,
  category = "Outros",
  requestId?: string,
  messageId?: string,
) {
  const data = new FormData();
  data.set("file", file);
  data.set("projectId", projectId);
  data.set("category", category);
  if (requestId) data.set("requestId", requestId);
  if (messageId) data.set("messageId", messageId);
  const response = await fetch("/api/portal/files", {
    method: "POST",
    body: data,
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Falha ao enviar o arquivo.");
  return result;
}

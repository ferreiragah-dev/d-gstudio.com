"use client";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, LoaderCircle, Plus } from "lucide-react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { fileCategories, requestCategories } from "@/config/portal";
import { portalPost, uploadPortalFile } from "./api";

function Feedback({ error, success }: { error: string; success?: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="form-feedback feedback-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="form-feedback">
          {success}
        </p>
      )}
    </>
  );
}
export function RequestDialog({
  projectId,
  title = "Solicitar alteração",
  initialCategory = "Outro",
  initialModule = "",
}: {
  projectId: string;
  title?: string;
  initialCategory?: string;
  initialModule?: string;
}) {
  const formId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<string>();
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      let id = created;
      if (!id) {
        const result = await portalPost("request", {
          ...Object.fromEntries(form),
          projectId,
        });
        id = result.id!;
        setCreated(id);
      }
      const file = form.get("attachment");
      if (file instanceof File && file.size)
        await uploadPortalFile(file, projectId, "Outros", id);
      dialog.current?.close();
      setCreated(undefined);
      router.push(`/cliente/solicitacoes?projeto=${projectId}&item=${id}`);
      router.refresh();
    } catch (error) {
      setError(
        (created ? "A solicitação foi salva; " : "") +
          (error instanceof Error ? error.message : "Tente novamente."),
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Button onClick={() => dialog.current?.showModal()} variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {title}
      </Button>
      <dialog
        ref={dialog}
        className="project-dialog portal-dialog"
        aria-labelledby={`${formId}-heading`}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <div className="dialog-inner">
          <button
            type="button"
            className="dialog-close"
            aria-label="Fechar solicitação"
            disabled={pending}
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
          <h2 id={`${formId}-heading`}>{title}</h2>
          <p>
            Conte o que precisa mudar. A equipe avaliará o escopo e o prazo.
          </p>
          <form onSubmit={submit} className="portal-form" aria-busy={pending}>
            <fieldset disabled={pending || !!created}>
              <Input
                id={`${formId}-title`}
                name="title"
                label="Título"
                required
                maxLength={200}
              />
              <div className="form-grid">
                <Select
                  id={`${formId}-category`}
                  name="category"
                  label="Categoria"
                  defaultValue={initialCategory}
                >
                  {requestCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </Select>
                <Select
                  id={`${formId}-priority`}
                  name="client_priority"
                  label="Prioridade para você"
                  defaultValue="Normal"
                >
                  <option>Baixa</option>
                  <option>Normal</option>
                  <option>Alta</option>
                </Select>
              </div>
              <Input
                id={`${formId}-module`}
                name="module"
                label="Tela ou módulo"
                defaultValue={initialModule}
                maxLength={200}
              />
              <Textarea
                id={`${formId}-description`}
                name="description"
                label="Descrição"
                required
                maxLength={5000}
              />
            </fieldset>
            <Input
              id={`${formId}-attachment`}
              name="attachment"
              label="Anexo (opcional)"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx,.zip"
              hint="Até 5 MB. Você poderá adicionar mais arquivos na solicitação."
              disabled={pending}
            />
            <p className="portal-muted">
              A prioridade indicada ajuda a equipe a entender sua necessidade. A
              ordem de execução depende da análise do projeto.
            </p>
            <Feedback error={error} />
            <Button type="submit" disabled={pending}>
              {pending && <LoaderCircle className="spin" size={16} />}{" "}
              {created ? "Concluir envio do anexo" : "Enviar solicitação"}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
export function ApprovalActions({
  projectId,
  id,
  title,
  version,
}: {
  projectId: string;
  id: string;
  title: string;
  version: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [decision, setDecision] = useState("approved");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      await portalPost("approval", {
        projectId,
        id,
        decision,
        comment: form.get("comment"),
      });
      dialog.current?.close();
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="portal-row">
        <Button
          onClick={() => {
            setDecision("approved");
            setError("");
            dialog.current?.showModal();
          }}
        >
          Aprovar
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setDecision("revision_requested");
            setError("");
            dialog.current?.showModal();
          }}
        >
          Solicitar ajuste
        </Button>
      </div>
      <dialog
        ref={dialog}
        className="project-dialog portal-dialog"
        aria-labelledby={`approval-title-${id}`}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <div className="dialog-inner">
          <button
            type="button"
            disabled={pending}
            className="dialog-close"
            aria-label="Fechar aprovação"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
          <h2 id={`approval-title-${id}`}>
            {decision === "approved"
              ? "Confirmar aprovação"
              : "Solicitar ajuste"}
          </h2>
          <p>
            {title} • {version}. Sua decisão será registrada com data, horário e
            usuário.
          </p>
          <form onSubmit={submit} className="portal-form">
            <Textarea
              id={`approval-comment-${id}`}
              name="comment"
              label={
                decision === "approved"
                  ? "Comentário (opcional)"
                  : "Descreva o ajuste desejado"
              }
              required={decision !== "approved"}
              minLength={decision !== "approved" ? 5 : undefined}
              maxLength={3000}
              disabled={pending}
            />
            <Feedback error={error} />
            <Button type="submit" disabled={pending}>
              {pending
                ? "Registrando…"
                : decision === "approved"
                  ? "Confirmar aprovação"
                  : "Enviar ajuste"}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
export function MessageForm({
  projectId,
  requestId,
}: {
  projectId: string;
  requestId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [created, setCreated] = useState<string>();
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setPending(true);
    setError("");
    setSuccess("");
    try {
      let id = created;
      if (!id) {
        const result = await portalPost(requestId ? "comment" : "message", {
          projectId,
          requestId,
          message: form.get("message"),
        });
        id = result.id!;
        setCreated(id);
      }
      const file = form.get("attachment");
      if (file instanceof File && file.size)
        await uploadPortalFile(
          file,
          projectId,
          "Outros",
          requestId,
          requestId ? undefined : id,
        );
      element.reset();
      setCreated(undefined);
      setSuccess("Mensagem enviada.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="portal-form"
      aria-label={requestId ? "Comentar solicitação" : "Enviar mensagem"}
      aria-busy={pending}
    >
      <Textarea
        id="conversation-message"
        name="message"
        label={requestId ? "Adicionar comentário" : "Mensagem para a equipe"}
        required
        maxLength={5000}
        disabled={pending || !!created}
      />
      <Input
        id="conversation-file"
        name="attachment"
        type="file"
        label="Anexo (opcional)"
        accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx,.zip"
        hint="Até 5 MB."
        disabled={pending}
      />
      {created && (
        <p className="portal-muted">
          A mensagem está salva. Você pode reenviar o anexo ou concluir sem ele.
        </p>
      )}
      <Feedback error={error} success={success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : created ? "Concluir envio" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
export function FileUpload({
  projectId,
  requestId,
}: {
  projectId: string;
  requestId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setPending(true);
    setError("");
    try {
      const file = form.get("file");
      if (!(file instanceof File) || !file.size)
        throw new Error("Selecione um arquivo.");
      await uploadPortalFile(
        file,
        projectId,
        String(form.get("category")),
        requestId,
      );
      element.reset();
      setSuccess("Arquivo enviado.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <details className="portal-upload">
      <summary>Adicionar arquivo</summary>
      <form onSubmit={submit} className="portal-form" aria-busy={pending}>
        <fieldset disabled={pending}>
          <Input
            id="upload-file"
            name="file"
            type="file"
            label="Arquivo"
            required
            accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx,.zip"
            hint="Até 5 MB por arquivo."
          />
          <Select id="upload-category" name="category" label="Categoria">
            {fileCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </Select>
          <Button type="submit">
            {pending ? "Enviando…" : "Enviar arquivo"}
          </Button>
        </fieldset>
        <Feedback error={error} success={success} />
      </form>
    </details>
  );
}
export function Welcome() {
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState("");
  return dismissed ? null : (
    <section className="portal-card portal-welcome">
      <span className="eyebrow">SEU PROJETO, MAIS PERTO</span>
      <h2>Bem-vindo à sua área de projeto</h2>
      <p>
        Aqui você poderá acompanhar o andamento do desenvolvimento, visualizar
        entregas, aprovar etapas e conversar com nossa equipe.
      </p>
      <Button
        onClick={async () => {
          try {
            await portalPost("welcome", {});
            setDismissed(true);
          } catch {
            setError(
              "Não foi possível salvar sua preferência. Tente novamente.",
            );
          }
        }}
      >
        Conhecer minha área
      </Button>
      <Feedback error={error} />
    </section>
  );
}

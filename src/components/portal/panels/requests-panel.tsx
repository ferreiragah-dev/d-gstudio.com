import Link from "next/link";
import { FileUpload, MessageForm, RequestDialog } from "../actions";
import {
  dateLabel,
  EmptyState,
  FileLinks,
  StatusBadge,
} from "../project-components";
import type { SectionProps } from "./types";
export function RequestsPanel({
  project,
  data,
  itemId,
}: SectionProps) {
  const link = (section: string) => `/cliente/${section}?projeto=${project.id}`;
  return (
    <div className="portal-stack">
      <div className="portal-row portal-between">
        <RequestDialog projectId={project.id} />
        {itemId && (
          <Link className="text-link" href={link("solicitacoes")}>
            ← Todas as solicitações
          </Link>
        )}
      </div>
      {data.items.length ? (
        data.items.map((item) => (
          <article key={item.id} className="portal-card">
            <div className="portal-row portal-between">
              <small className="portal-muted">
                #DG-{item.number} · {dateLabel(item.created_at)}
              </small>
              <StatusBadge status={String(item.status)} />
            </div>
            <h2>
              <Link href={`${link("solicitacoes")}&item=${item.id}`}>
                {item.title}
              </Link>
            </h2>
            <p className="portal-message-text">{item.description}</p>
            <small className="portal-muted">
              {item.category} · {item.module || "Projeto"} · Prioridade
              informada: {item.client_priority} · Responsável:{" "}
              {item.owner || "Em análise"}
            </small>
            {itemId && (
              <>
                <h3>Conversa da solicitação</h3>
                <MessageForm projectId={project.id} requestId={item.id} />
                <ol className="portal-conversation">
                  {data.comments?.map((comment) => (
                    <li key={comment.id}>
                      <strong>
                        {comment.author}
                        {comment.author_role === "team" ? " · Equipe D&G" : ""}
                      </strong>
                      <small>{dateLabel(comment.created_at, true)}</small>
                      <p className="portal-message-text">{comment.message}</p>
                    </li>
                  ))}
                </ol>
                <h3>Anexos</h3>
                <FileUpload projectId={project.id} requestId={item.id} />
                {data.files?.map((file) => (
                  <div className="portal-row portal-between" key={file.id}>
                    <span>{file.name}</span>
                    <FileLinks file={file} />
                  </div>
                ))}
              </>
            )}
          </article>
        ))
      ) : (
        <EmptyState
          title="Nenhuma solicitação ainda"
          description="Caso precise de alguma alteração, você poderá criar uma solicitação por aqui."
        />
      )}
    </div>
  );
}

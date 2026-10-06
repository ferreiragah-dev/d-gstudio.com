import { MessageForm } from "../actions";
import { dateLabel, EmptyState, FileLinks } from "../project-components";
import type { SectionProps } from "./types";
export function MessagesPanel({ project, data }: SectionProps) {
  return (
    <section className="portal-card">
      <MessageForm projectId={project.id} />
      {data.items.length ? (
        <ol className="portal-conversation">
          {data.items.map((item) => (
            <li
              key={item.id}
              className={
                item.author_role === "team" ? "portal-team-message" : ""
              }
            >
              <div className="portal-row portal-between">
                <strong>
                  {item.author}
                  {item.author_role === "team" ? " · Equipe D&G" : ""}
                </strong>
                <small>{dateLabel(item.created_at, true)}</small>
              </div>
              <p className="portal-message-text">{item.message}</p>
              {data.files
                ?.filter((file) => file.message_id === item.id)
                .map((file) => (
                  <div key={file.id}>
                    <span>{file.name}</span>
                    <FileLinks file={file} />
                  </div>
                ))}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          title="Vamos começar uma conversa"
          description="Envie uma mensagem para nossa equipe. O histórico do projeto ficará reunido aqui."
        />
      )}
    </section>
  );
}

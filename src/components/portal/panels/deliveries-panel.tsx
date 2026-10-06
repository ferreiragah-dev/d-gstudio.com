import { ButtonLink } from "@/components/ui";
import { ApprovalActions, RequestDialog } from "../actions";
import { dateLabel, EmptyState, StatusBadge } from "../project-components";
import type { SectionProps } from "./types";
export function DeliveriesPanel({ section, project, data }: SectionProps) {
  const link = (section: string) => `/cliente/${section}?projeto=${project.id}`;
  return (
    <div className="portal-stack">
      {data.items.length ? (
        data.items.map((item) => (
          <article className="portal-card" key={item.id}>
            <div className="portal-row portal-between">
              <h2>{item.title}</h2>
              <StatusBadge status={String(item.status)} />
            </div>
            <small className="portal-muted">
              Versão {item.version} · Publicada em{" "}
              {dateLabel(item.created_at, true)}
            </small>
            <p className="portal-message-text">{item.description}</p>
            {section === "entregas" &&
              data.tasks
                ?.filter((task) => task.delivery_id === item.id)
                .map((task) => <p key={task.id}>• {task.title}</p>)}
            <div className="portal-row">
              {item.url && (
                <ButtonLink
                  href={String(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                >
                  {section === "entregas" ? "Abrir versão" : "Visualizar"}
                </ButtonLink>
              )}
              {section === "entregas" ? (
                <>
                  <RequestDialog
                    projectId={project.id}
                    title="Enviar feedback"
                    initialModule={String(item.version)}
                  />
                  <ButtonLink href={link("aprovacoes")} variant="secondary">
                    Revisar aprovações
                  </ButtonLink>
                </>
              ) : item.status === "pending" ? (
                <ApprovalActions
                  projectId={project.id}
                  id={item.id}
                  title={String(item.title)}
                  version={String(item.version)}
                />
              ) : (
                <p className="portal-muted">
                  Revisado por {item.decided_by_name} em{" "}
                  {dateLabel(item.decided_at as string, true)}
                  {item.comment ? ` · ${item.comment}` : ""}
                </p>
              )}
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          title={
            section === "entregas"
              ? "Nenhuma entrega publicada ainda"
              : "Nenhuma aprovação pendente"
          }
        />
      )}
    </div>
  );
}

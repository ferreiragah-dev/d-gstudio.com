import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock3,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { projectProgress, statusLabels } from "@/config/portal";
import type { Phase, PortalRecord } from "@/types/portal";
export const dateLabel = (value: string | null | undefined, time = false) =>
  value
    ? new Date(
        value.length === 10 ? `${value}T12:00:00-03:00` : value,
      ).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "A definir";
export const moneyLabel = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`portal-status portal-status-${status}`}>
      {statusLabels[status] || status}
    </Badge>
  );
}
export function EmptyState({
  title = "Nada por aqui ainda",
  description = "As informações aparecerão aqui assim que nossa equipe publicar uma atualização.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="portal-empty">
      <FolderIcon />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
function FolderIcon() {
  return <Circle size={28} aria-hidden="true" />;
}
export function ProjectProgress({
  phases,
  updatedAt,
}: {
  phases: Phase[];
  updatedAt: string;
}) {
  const progress = projectProgress(phases);
  const phase = phases.find(
    (phase) => phase.status === "in_progress" || phase.status === "blocked",
  );
  return (
    <section className="portal-card">
      <div className="portal-row portal-between">
        <h2>Progresso do projeto</h2>
        <strong className="portal-progress-number">{progress}%</strong>
      </div>
      <div
        className="portal-progress"
        role="progressbar"
        aria-label="Progresso do projeto"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="portal-row portal-between portal-muted">
        <span>
          {phase?.title ||
            (phases.length && progress === 100
              ? "Todas as etapas concluídas"
              : "Etapas a definir")}
        </span>
        <small>Atualizado em {dateLabel(updatedAt, true)}</small>
      </div>
    </section>
  );
}
export function ProjectStepper({
  phases,
  tasks = [],
}: {
  phases: Phase[];
  tasks?: PortalRecord[];
}) {
  if (!phases.length) return <EmptyState title="Etapas em preparação" />;
  return (
    <ol className="portal-stepper">
      {phases.map((phase) => (
        <li key={phase.id}>
          <div className={`portal-step-icon portal-status-${phase.status}`}>
            {phase.status === "completed" ? (
              <CheckCircle2 size={22} />
            ) : phase.status === "blocked" ? (
              <AlertCircle size={22} />
            ) : phase.status === "in_progress" ? (
              <Clock3 size={22} />
            ) : (
              <Circle size={22} />
            )}
          </div>
          <details className="portal-step">
            <summary>
              <span>
                {phase.title}
                <small>{phase.owner || "Equipe D&G Studio"}</small>
              </span>
              <StatusBadge status={phase.status} />
            </summary>
            <div className="portal-step-details">
              <p>
                {phase.description ||
                  "Os detalhes desta etapa serão publicados pela equipe."}
              </p>
              <p className="portal-muted">
                Início: {dateLabel(phase.starts_on)} · Previsão:{" "}
                {dateLabel(phase.due_on)}
                {phase.completed_on
                  ? ` · Concluída em: ${dateLabel(phase.completed_on)}`
                  : ""}
              </p>
              <p>
                Progresso:{" "}
                {phase.status === "completed"
                  ? 100
                  : phase.total_tasks
                    ? Math.round(
                        (phase.completed_tasks / phase.total_tasks) * 100,
                      )
                    : 0}
                %
              </p>
              <ul className="portal-checklist">
                {tasks
                  .filter((task) => task.phase_id === phase.id)
                  .map((task) => (
                    <li key={task.id}>
                      {task.status === "completed" ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <Circle size={15} />
                      )}
                      <span>{task.title}</span>
                      <StatusBadge status={String(task.status)} />
                    </li>
                  ))}
              </ul>
              {phase.notes && <p>{phase.notes}</p>}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
export function ProjectTimeline({ items }: { items: PortalRecord[] }) {
  return !items.length ? (
    <EmptyState title="Nenhuma atualização publicada ainda" />
  ) : (
    <ol className="portal-timeline">
      {items.map((item) => (
        <li key={item.id}>
          <small>
            {dateLabel(item.created_at, true)} · {item.author}
          </small>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.related_url && (
            <a
              href={String(item.related_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Ver atualização <ArrowUpRight size={14} />
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}
export function FileLinks({ file }: { file: PortalRecord }) {
  return (
    <div className="portal-file-links">
      <Link
        href={`/api/portal/files/${file.id}?view=1`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Visualizar
      </Link>
      <Link href={`/api/portal/files/${file.id}`}>Baixar</Link>
    </div>
  );
}

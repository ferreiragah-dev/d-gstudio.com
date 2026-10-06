import Link from "next/link";
import { scheduleState } from "@/config/portal";
import {
  dateLabel,
  EmptyState,
  ProjectStepper,
  StatusBadge,
} from "../project-components";
import type { SectionProps } from "./types";
export function SchedulePanel({ project, data }: SectionProps) {
  const link = (section: string) => `/cliente/${section}?projeto=${project.id}`;
  return (
    <div className="portal-stack">
      <section className="portal-card">
        <div className="portal-row portal-between">
          <h2>Do início à entrega</h2>
          <span>
            {scheduleState(project.due_on, project.status, data.phases || [])}
          </span>
        </div>
        <dl className="portal-definition">
          <div>
            <dt>Início do projeto</dt>
            <dd>{dateLabel(project.starts_on)}</dd>
          </div>
          <div>
            <dt>Conclusão prevista</dt>
            <dd>{dateLabel(project.due_on)}</dd>
          </div>
        </dl>
        <ProjectStepper phases={data.phases || []} tasks={data.tasks} />
      </section>
      <section className="portal-card">
        <h2>Marcos e entregas previstas</h2>
        {data.milestones?.length ? (
          <ul className="portal-list">
            {data.milestones.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>{dateLabel(String(item.due_on))}</small>
                </div>
                <StatusBadge
                  status={
                    item.status !== "completed" &&
                    String(item.due_on) < new Date().toISOString().slice(0, 10)
                      ? "Atrasado"
                      : String(item.status)
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Cronograma em preparação" />
        )}
      </section>
      <section className="portal-card">
        <h2>Entregas e aprovações recentes</h2>
        {data.deliveries?.map((item) => (
          <div key={item.id} className="portal-row portal-between">
            <Link href={link("entregas")}>
              {item.title} · {item.version}
            </Link>
            <small>{dateLabel(item.created_at, true)}</small>
            <StatusBadge status={String(item.status)} />
          </div>
        ))}
        {data.approvals?.map((item) => (
          <div key={item.id} className="portal-row portal-between">
            <Link href={link("aprovacoes")}>
              {item.title} · {item.version}
            </Link>
            <StatusBadge status={String(item.status)} />
          </div>
        ))}
        {!data.deliveries?.length && !data.approvals?.length && (
          <p className="portal-muted">
            As publicações e os itens para revisão aparecerão aqui.
          </p>
        )}
      </section>
    </div>
  );
}

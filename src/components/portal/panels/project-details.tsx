import { ButtonLink } from "@/components/ui";
import { dateLabel, ProjectProgress, StatusBadge } from "../project-components";
import type { SectionProps } from "./types";
export function ProjectDetails({ project, data }: SectionProps) {
  return (
    <div className="portal-stack">
      <ProjectProgress
        phases={data.phases || []}
        updatedAt={project.updated_at}
      />
      <section className="portal-card">
        <h2>{project.name}</h2>
        <p>{project.description || "Descrição em preparação."}</p>
        <dl className="portal-definition">
          <div>
            <dt>Empresa</dt>
            <dd>{project.client_name}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{project.type || "A definir"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={project.status} />
            </dd>
          </div>
          <div>
            <dt>Início</dt>
            <dd>{dateLabel(project.starts_on)}</dd>
          </div>
          <div>
            <dt>Previsão de entrega</dt>
            <dd>{dateLabel(project.due_on)}</dd>
          </div>
          <div>
            <dt>Responsáveis</dt>
            <dd>
              {data.team?.map((member) => member.name).join(", ") ||
                "A definir"}
            </dd>
          </div>
        </dl>
        <h3>Escopo do projeto</h3>
        <p className="portal-message-text">
          {project.scope || "O escopo será disponibilizado pela equipe."}
        </p>
        <div className="portal-row">
          {project.preview_url && (
            <ButtonLink
              href={project.preview_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir homologação
            </ButtonLink>
          )}
          {project.public_url && (
            <ButtonLink
              href={project.public_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              Abrir projeto publicado
            </ButtonLink>
          )}
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import type { PortalProject } from "@/types/portal";
import { dateLabel, EmptyState, StatusBadge } from "./project-components";

export function ProjectPicker({ projects }: { projects: PortalProject[] }) {
  return (
    <div className="portal-stack">
      <div className="portal-page-heading">
        <div>
          <span className="eyebrow">ADMINISTRAÇÃO</span>
          <h1>Todos os projetos</h1>
          <p>
            Selecione um projeto para acessar sua área e gerenciar as
            informações.
          </p>
        </div>
        <ButtonLink href="/equipe?gestao=1" variant="secondary">
          Gerenciar clientes e projetos
        </ButtonLink>
      </div>
      {projects.length ? (
        <div className="portal-project-grid">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/equipe?projeto=${project.id}`}
              className="portal-card portal-project-choice"
            >
              <div className="portal-row portal-between">
                <FolderKanban size={24} aria-hidden="true" />
                <StatusBadge status={project.status} />
              </div>
              <div>
                <small className="portal-muted">{project.client_name}</small>
                <h2>{project.name}</h2>
                {project.description && (
                  <p className="portal-project-description">
                    {project.description}
                  </p>
                )}
              </div>
              <small className="portal-muted">
                Previsão: {dateLabel(project.due_on)}
              </small>
              <span className="text-link">
                Abrir projeto <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum projeto cadastrado"
          description="Use Gerenciar clientes e projetos para cadastrar o primeiro projeto."
        />
      )}
    </div>
  );
}

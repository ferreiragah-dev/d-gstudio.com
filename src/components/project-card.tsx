"use client";
import { useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { Project } from "@/types";
import { ProjectPreview } from "./project-preview";
import { Badge, ButtonLink } from "./ui";

export function ProjectCard({ project }: { project: Project }) {
  const dialog = useRef<HTMLDialogElement>(null);
  function close() {
    dialog.current?.close();
  }
  return (
    <article className="project-card" data-reveal>
      <button
        className="project-open"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Ver projeto: ${project.name}`}
      >
        <div aria-hidden="true">
          <ProjectPreview project={project} />
        </div>
        <span className="project-overlay">
          Ver projeto <ArrowUpRight size={19} />
        </span>
      </button>
      <div className="project-meta">
        <div>
          <span>
            {project.category} <i /> CONCEITO DEMONSTRATIVO
          </span>
          <h3>
            <button onClick={() => dialog.current?.showModal()}>
              {project.name}
              <ArrowUpRight size={20} aria-hidden="true" />
            </button>
          </h3>
        </div>
        <span className="project-number">/{project.id}</span>
      </div>
      <dialog
        ref={dialog}
        className="project-dialog"
        aria-labelledby={`project-title-${project.id}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="dialog-inner">
          <button
            className="dialog-close"
            aria-label="Fechar projeto"
            onClick={close}
          >
            <X size={21} />
          </button>
          <ProjectPreview project={project} />
          <div className="dialog-copy">
            <Badge>CONCEITO DEMONSTRATIVO</Badge>
            <h2 id={`project-title-${project.id}`}>{project.name}</h2>
            <p>{project.description}</p>
            <div className="dialog-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="demo-disclaimer">
              Estudo visual criado pela D&G Studio para demonstrar
              possibilidades. Não representa um cliente ou uma loja em operação.
            </p>
            <ButtonLink
              href={`?tipo=${encodeURIComponent(project.type)}#orcamento`}
              arrow
              onClick={close}
            >
              Quero um projeto assim
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </article>
  );
}

import { ArrowUpRight, ArrowRight, Menu, Plus } from "lucide-react";
import type { Project } from "@/types";

export function ProjectPreview({ project }: { project: Project }) {
  return (
    <div
      className={`project-preview preview-${project.theme}`}
      role="img"
      aria-label={`Mockup demonstrativo: ${project.name} — ${project.category}`}
    >
      <div className="preview-browser">
        <span />
        <span />
        <span />
        <div>CONCEITO D&G STUDIO</div>
      </div>
      <div className="preview-site">
        <div className="preview-nav">
          <span>
            {project.theme === "architecture"
              ? "forma"
              : project.theme === "wellness"
                ? "viva."
                : project.theme === "photography"
                  ? "olhar®"
                  : "essenza"}
          </span>
          <div>
            Sobre&nbsp;&nbsp;&nbsp;{" "}
            {project.theme === "store" ? "Coleção" : "Projetos"}
            &nbsp;&nbsp;&nbsp; Contato
          </div>
          <Menu size={10} />
        </div>
        <div className="preview-content">
          <div className="preview-copy">
            <span className="preview-kicker">
              {project.category.toUpperCase()} · DESIGN COM PROPÓSITO
            </span>
            <h3>{project.headline}</h3>
            <p>
              {project.theme === "store"
                ? "Objetos que transformam o seu espaço."
                : "Uma nova perspectiva para o que importa."}
            </p>
            <span className="preview-cta">
              {project.theme === "store"
                ? "Explore a coleção"
                : "Conheça a essência"}{" "}
              <ArrowUpRight size={10} />
            </span>
          </div>
          <div className="preview-visual">
            <div className="visual-object object-one" />
            <div className="visual-object object-two" />
            <div className="visual-object object-three" />
            <span className="visual-label">
              {project.theme === "photography"
                ? "LUZ / FORMA / TEMPO"
                : project.theme === "architecture"
                  ? "ARQUITETURA & INTERIORES"
                  : project.theme === "wellness"
                    ? "SEU TEMPO. SEU EQUILÍBRIO."
                    : "A BELEZA DO ESSENCIAL"}
            </span>
          </div>
        </div>
        <div className="preview-footer">
          <span>
            {project.theme === "photography"
              ? "Histórias em cada detalhe."
              : "Feito para inspirar."}
          </span>
          {project.theme === "store" ? (
            <Plus size={11} />
          ) : (
            <ArrowRight size={13} />
          )}
        </div>
      </div>
    </div>
  );
}

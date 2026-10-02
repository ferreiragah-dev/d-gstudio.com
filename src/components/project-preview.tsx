import Image from "next/image";
import type { Project } from "@/types";

export function ProjectPreview({ project }: { project: Project }) {
  return (
    <div className="project-preview">
      <div className="preview-browser">
        <span />
        <span />
        <span />
        <div>CONCEITO D&G STUDIO</div>
      </div>
      <Image
        className="preview-image"
        src={project.image}
        alt={`Mockup demonstrativo: ${project.name} — ${project.category}`}
        width={600}
        height={640}
        sizes="(max-width: 760px) 100vw, 50vw"
      />
    </div>
  );
}

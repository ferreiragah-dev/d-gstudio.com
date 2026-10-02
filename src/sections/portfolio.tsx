import { Container, SectionHeader } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export function Portfolio() {
  return (
    <section className="section portfolio-section" id="portfolio">
      <Container>
        <div className="heading-row">
          <SectionHeader
            eyebrow="PORTFÓLIO"
            title={
              <>
                Projetos que geram
                <br />
                <span className="accent-text">resultados.</span>
              </>
            }
          />
          <div className="section-side-description">
            <p>
              Design que dá forma às ideias. Explore conceitos e possibilidades
              para a sua presença digital.
            </p>
            <span className="demo-note">
              <span /> Seleção de projetos demonstrativos
            </span>
          </div>
        </div>
        <div className="portfolio-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Container>
    </section>
  );
}

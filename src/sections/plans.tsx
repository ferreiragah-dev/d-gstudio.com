import { Container, SectionHeader } from "@/components/ui";
import { PlansCarousel } from "@/components/plans-carousel";
import { plans } from "@/data/plans";
export function Plans() {
  return (
    <section className="section plans-section" id="projetos">
      <Container>
        <SectionHeader
          centered
          eyebrow="PROJETOS"
          title={
            <>
              Projetos para{" "}
              <span className="accent-text">cada necessidade.</span>
            </>
          }
          description="Do primeiro passo a uma solução completa. Encontre o ponto de partida para o seu projeto."
        />
        <PlansCarousel plans={plans} />
      </Container>
    </section>
  );
}

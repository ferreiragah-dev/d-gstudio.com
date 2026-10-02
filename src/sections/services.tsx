import { ArrowUpRight, Braces, CornerDownRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/ui";
import { ServiceCard } from "@/components/service-card";
import { ServicesAnimation } from "@/components/services-animation";
import { services, siteTypes, portfolioTypes } from "@/data/services";

export function Services() {
  return (
    <section id="servicos" className="section services-section">
      <Container>
        <div className="heading-row">
          <SectionHeader
            eyebrow="SERVIÇOS"
            title={
              <>
                Tudo o que você precisa
                <br />
                para estar <span className="accent-text">no digital.</span>
              </>
            }
          />
          <p className="section-side-description">
            Soluções completas, do site institucional ao sistema personalizado e
            integrações, sempre com foco em resultado.
          </p>
        </div>
        <div className="services-grid" id="servicos-grid">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
        <ServicesAnimation gridId="servicos-grid" />
        <div className="custom-note">
          <Braces size={19} aria-hidden="true" />
          <p>
            Sua ideia não cabe em uma categoria?{" "}
            <a href="#orcamento">
              A gente cria sob medida. <ArrowUpRight size={14} />
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}

export function ProjectTypes() {
  return (
    <section className="section types-section" id="possibilidades">
      <Container>
        <div className="types-layout">
          <div data-reveal>
            <span className="eyebrow">
              <span />
              UM DIGITAL COM A SUA CARA
            </span>
            <h2>
              Para cada ideia,
              <br />
              <span className="muted-heading">uma possibilidade.</span>
            </h2>
            <p>
              Soluções digitais sob medida para pessoas, profissionais e
              empresas. O ponto de partida é você.
            </p>
            <a href="#orcamento" className="text-link">
              Encontre a solução para você <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="type-chips" data-reveal>
            {siteTypes.map((type) => (
              <span key={type}>{type}</span>
            ))}
          </div>
        </div>
        <div className="portfolio-types" data-reveal>
          <div>
            <CornerDownRight size={26} aria-hidden="true" />
            <h3>
              Seu trabalho merece
              <br />
              uma presença à altura.
            </h3>
          </div>
          <div className="portfolio-type-list">
            {portfolioTypes.map((type) => (
              <span key={type}>{type}</span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

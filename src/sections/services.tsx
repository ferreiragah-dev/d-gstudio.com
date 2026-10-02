import { ArrowUpRight, Braces } from "lucide-react";
import { Container, SectionHeader } from "@/components/ui";
import { ServiceCard } from "@/components/service-card";
import { ServicesAnimation } from "@/components/services-animation";
import { services } from "@/data/services";

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

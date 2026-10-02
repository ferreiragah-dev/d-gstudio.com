import {
  ArrowDown,
  Gauge,
  Headphones,
  MonitorSmartphone,
  PenTool,
} from "lucide-react";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { DeviceMockup } from "@/components/device-mockup";

export function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <Container>
        <div className="hero-grid">
          <div className="hero-copy">
            <Badge>
              <span className="status-dot" />
              SOLUÇÕES DIGITAIS SOB MEDIDA
            </Badge>
            <h1 id="hero-title">
              Criamos experiências digitais para{" "}
              <span className="gradient-text">pessoas e empresas.</span>
            </h1>
            <p>
              Sites, portfólios, landing pages e sistemas web sob medida, com
              design moderno, performance e foco em resultados.
            </p>
            <div className="hero-actions">
              <ButtonLink href="#orcamento" arrow>
                Solicite um orçamento
              </ButtonLink>
              <ButtonLink href="#servicos" variant="secondary">
                Conheça nossos serviços
              </ButtonLink>
            </div>
            <div className="hero-features">
              {[
                [PenTool, "Design moderno"],
                [MonitorSmartphone, "Responsivo"],
                [Gauge, "Alta performance"],
                [Headphones, "Suporte contínuo"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof PenTool;
                return (
                  <span key={String(label)}>
                    <FeatureIcon size={14} aria-hidden="true" />
                    {String(label)}
                  </span>
                );
              })}
            </div>
          </div>
          <DeviceMockup />
        </div>
        <div className="hero-baseline">
          <span>
            ESTRATÉGIA, DESIGN E TECNOLOGIA. <b>JUNTOS.</b>
          </span>
          <a href="#servicos">
            Explore as possibilidades <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
      </Container>
    </section>
  );
}

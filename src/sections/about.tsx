import {
  Code2,
  Gauge,
  HeartHandshake,
  MonitorSmartphone,
  PenTool,
  ScanFace,
  ArrowUpRight,
} from "lucide-react";
import { Container, SectionHeader } from "@/components/ui";

const differences = [
  { icon: PenTool, title: "Design personalizado" },
  { icon: Gauge, title: "Performance" },
  { icon: MonitorSmartphone, title: "Responsividade" },
  { icon: ScanFace, title: "Experiência do usuário" },
  { icon: Code2, title: "Tecnologia moderna" },
  { icon: HeartHandshake, title: "Acompanhamento próximo" },
];
export function About() {
  return (
    <section className="section about-section" id="sobre">
      <Container className="about-grid">
        <div className="about-art" data-reveal aria-hidden="true">
          <div className="about-grid-pattern" />
          <span className="art-top">
            PENSAMENTO CRIATIVO. EXECUÇÃO PRECISA.
          </span>
          <div className="about-monogram">
            D<span>&</span>G<span>.</span>
          </div>
          <span className="art-studio">STUDIO</span>
          <div className="art-caption">
            <span>
              Ideia. Estratégia. Design.
              <br />
              Desenvolvimento. <b>Resultado.</b>
            </span>
            <ArrowUpRight size={32} strokeWidth={1} />
          </div>
          <div className="art-cross cross-one">+</div>
          <div className="art-cross cross-two">+</div>
        </div>
        <div>
          <SectionHeader
            eyebrow="SOBRE A D&G STUDIO"
            title={
              <>
                Mais que desenvolvimento.
                <br />
                <span className="accent-text">Criamos experiências.</span>
              </>
            }
          />
          <div className="about-copy">
            <p>
              Na D&G Studio, transformamos ideias em experiências digitais
              modernas, funcionais e pensadas para gerar resultados.
            </p>
            <p>
              Cada projeto é desenvolvido de forma personalizada, unindo
              estratégia, design e tecnologia para criar soluções que realmente
              façam sentido para cada cliente.
            </p>
          </div>
          <div className="differences">
            {differences.map(({ icon: Icon, title }) => (
              <span key={title}>
                <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                {title}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

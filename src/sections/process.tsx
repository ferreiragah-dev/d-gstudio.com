import { ArrowRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/ui";

const steps = [
  [
    "Você apresenta sua ideia",
    "Tudo começa com uma boa conversa sobre o que você quer construir.",
    "Ideia",
  ],
  [
    "Entendemos sua necessidade",
    "Definimos juntos os objetivos, o escopo e o caminho do projeto.",
    "Estratégia",
  ],
  [
    "Criamos o projeto",
    "Sua identidade ganha forma em uma experiência feita para você.",
    "Design",
  ],
  [
    "Você acompanha o desenvolvimento",
    "Transformamos o design em código, com você por perto.",
    "Desenvolvimento",
  ],
  [
    "Fazemos os ajustes",
    "Refinamos os detalhes e testamos cada parte da experiência.",
    "Testes",
  ],
  [
    "Publicamos e entregamos",
    "Tudo pronto para o seu próximo capítulo no digital.",
    "Publicação",
  ],
];
export function Process() {
  return (
    <section className="section process-section" id="processo">
      <Container>
        <SectionHeader
          centered
          eyebrow="COMO FUNCIONA"
          title={
            <>
              Do seu jeito,{" "}
              <span className="accent-text">sem complicação.</span>
            </>
          }
          description="Um processo simples e transparente para transformar sua ideia em um projeto digital de alto nível."
        />
        <ol className="process-timeline">
          {steps.map(([title, description, stage], index) => (
            <li key={title} data-reveal>
              <div className="step-number">
                0{index + 1}
                <span />
              </div>
              <span className="step-stage">{stage}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              {index < steps.length - 1 && (
                <ArrowRight
                  className="step-arrow"
                  size={14}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
        <p className="process-note">
          <span /> Você participa de cada etapa. A gente cuida de cada detalhe.
        </p>
      </Container>
    </section>
  );
}

import { ArrowUpRight, Code2, Layers3, Sparkles } from "lucide-react";
import { Logo } from "./logo";

export function DeviceMockup() {
  return (
    <div
      className="device-scene"
      role="img"
      aria-label="Notebook com a frase Soluções digitais que impulsionam o seu negócio, acompanhado de smartphone com Ideia, Design, Desenvolvimento, Resultado."
    >
      <div className="scene-orbit orbit-one" />
      <div className="scene-orbit orbit-two" />
      <div className="scene-grid" />
      <div className="floating-label label-design">
        <span>
          <Layers3 size={17} />
        </span>
        Design que conecta.
      </div>
      <div className="laptop">
        <div className="laptop-camera" />
        <div className="laptop-screen">
          <div className="mock-nav">
            <Logo compact />
            <div>
              <span>Início</span>
              <span>Soluções</span>
              <span>Projetos</span>
            </div>
            <span className="mock-nav-button">
              Vamos conversar <ArrowUpRight size={7} />
            </span>
          </div>
          <div className="mock-page">
            <span className="mock-eyebrow">
              ESTRATÉGIA. DESIGN. TECNOLOGIA.
            </span>
            <div className="mock-headline">
              Soluções digitais
              <br />
              que impulsionam
              <br />
              <span>o seu negócio.</span>
            </div>
            <p>
              Sites, sistemas e experiências digitais
              <br />
              pensados para gerar resultados reais.
            </p>
            <span className="mock-button">
              Começar agora <ArrowUpRight size={10} />
            </span>
            <div className="mock-art">
              <div />
              <div />
              <div />
            </div>
          </div>
          <div className="mock-bottom">
            <span>
              <Code2 size={12} /> Desenvolvimento
            </span>
            <span>
              <Layers3 size={12} /> Design sob medida
            </span>
            <span>
              <Sparkles size={12} /> Experiência
            </span>
          </div>
        </div>
        <div className="laptop-base">
          <span />
        </div>
      </div>
      <div className="phone">
        <div className="phone-island" />
        <div className="phone-top">
          <Logo compact />
          <span>≡</span>
        </div>
        <span className="phone-eyebrow">DO CONCEITO AO DIGITAL</span>
        <div className="phone-copy">
          Ideia.
          <br />
          Design.
          <br />
          Desenvolvimento.
          <br />
          <span>Resultado.</span>
        </div>
        <div className="phone-art">
          <span />
          <span />
          <span />
        </div>
        <div className="phone-bottom">
          Vamos criar juntos <ArrowUpRight size={10} />
        </div>
        <div className="phone-home" />
      </div>
      <div className="floating-label label-code">
        <span>
          <Code2 size={17} />
        </span>
        Feito para o seu negócio.
        <i />
      </div>
      <div className="scene-caption">
        <span /> DO PRIMEIRO PIXEL À ÚLTIMA LINHA DE CÓDIGO.
      </div>
    </div>
  );
}

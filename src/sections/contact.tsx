import { ArrowUpRight, Check, MessageCircle, MoveUpRight } from "lucide-react";
import { ButtonLink, Container, SectionHeader } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";
import { whatsappUrl } from "@/config/site";

export function Contact() {
  return (
    <section className="section contact-section" id="orcamento">
      <Container className="contact-grid">
        <div className="contact-intro">
          <SectionHeader
            eyebrow="VAMOS CONVERSAR"
            title={
              <>
                Conte sobre
                <br />
                <span className="accent-text">seu projeto.</span>
              </>
            }
            description="Preencha algumas informações e vamos entender como podemos transformar sua ideia em uma solução digital."
          />
          <ul className="contact-benefits">
            <li>
              <Check size={17} />
              Orçamento personalizado
            </li>
            <li>
              <Check size={17} />
              Conversa direta, sem complicação
            </li>
            <li>
              <Check size={17} />
              Sem compromisso
            </li>
          </ul>
          <div className="contact-decoration" aria-hidden="true">
            <MoveUpRight strokeWidth={0.6} />
            <span>
              Grandes projetos começam
              <br />
              com uma boa conversa.
            </span>
          </div>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              <MessageCircle size={18} />
              Prefere conversar pelo WhatsApp? <ArrowUpRight size={15} />
            </a>
          )}
        </div>
        <QuoteForm deliveryEnabled={!!process.env.QUOTE_WEBHOOK_URL} />
      </Container>
    </section>
  );
}
export function FinalCta() {
  return (
    <section className="final-cta">
      <Container>
        <div className="final-cta-inner" data-reveal>
          <span className="eyebrow">
            <span />
            SEU PRÓXIMO PASSO COMEÇA AQUI
          </span>
          <h2>
            Vamos tirar
            <br />
            seu projeto <span className="gradient-text">do papel?</span>
          </h2>
          <p>
            Conte sua ideia e receba um orçamento personalizado, sem
            compromisso.
          </p>
          <div className="cta-actions">
            <ButtonLink href="#orcamento" arrow>
              Solicitar orçamento
            </ButtonLink>
            {whatsappUrl && (
              <ButtonLink
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
              >
                <MessageCircle size={17} aria-hidden="true" />
                Falar no WhatsApp
              </ButtonLink>
            )}
          </div>
          <div className="cta-corner corner-tl" />
          <div className="cta-corner corner-tr" />
          <div className="cta-corner corner-bl" />
          <div className="cta-corner corner-br" />
        </div>
      </Container>
    </section>
  );
}

import { ArrowUpRight, Check, MessageCircle, MoveUpRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/ui";
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
        <QuoteForm
          deliveryEnabled={
            !!(
              process.env.QUOTE_WEBHOOK_URL ||
              (process.env.SMTP_USER && process.env.SMTP_PASSWORD)
            )
          }
        />
      </Container>
    </section>
  );
}

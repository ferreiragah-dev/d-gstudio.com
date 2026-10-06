import Link from "next/link";
import { ArrowUpRight, Camera, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./logo";
import { Container } from "./ui";
import { siteConfig, whatsappUrl } from "@/config/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/#inicio" aria-label="D&G Studio — início">
              <Logo />
            </Link>
            <p>
              Criamos experiências digitais
              <br />
              para pessoas e empresas.
            </p>
            <span className="footer-tagline">
              DESIGN COM PROPÓSITO. CÓDIGO COM PRECISÃO.
            </span>
          </div>
          <div className="footer-column">
            <h2>Serviços</h2>
            {[
              "Sites",
              "Landing Pages",
              "Portfólios",
              "E-commerce",
              "Sistemas Web",
              "Integrações",
            ].map((item) => (
              <Link key={item} href="/#servicos">
                {item}
              </Link>
            ))}
          </div>
          <div className="footer-column">
            <h2>Empresa</h2>
            <Link href="/#sobre">Sobre</Link>
            <Link href="/#processo">Processo</Link>
            <Link href="/#portfolio">Portfólio</Link>
            <Link href="/#orcamento">Orçamento</Link>
            <Link href="/cliente/login">Acompanhar meu projeto</Link>
          </div>
          <div className="footer-column">
            <h2>Vamos conversar</h2>
            {whatsappUrl && (
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={14} />
                WhatsApp <ArrowUpRight size={12} />
              </Link>
            )}
            {siteConfig.email && (
              <Link href={`mailto:${siteConfig.email}`}>
                <Mail size={14} />
                E-mail <ArrowUpRight size={12} />
              </Link>
            )}
            {siteConfig.instagram && (
              <Link
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Camera size={14} />
                Instagram <ArrowUpRight size={12} />
              </Link>
            )}
            <Link href="/#orcamento" className="footer-contact-link">
              Conte sua ideia <ArrowUpRight size={14} />
            </Link>
            <span className="footer-location">
              Conectados à sua próxima ideia.
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} D&G Studio — Todos os direitos
            reservados.
          </span>
          <div>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/#inicio">
              Voltar ao topo <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

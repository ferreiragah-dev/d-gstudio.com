import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/sections/hero";
import { Services } from "@/sections/services";
import { Process } from "@/sections/process";
import { Plans } from "@/sections/plans";
import { Portfolio } from "@/sections/portfolio";
import { About } from "@/sections/about";
import { Contact } from "@/sections/contact";
import { siteConfig } from "@/config/site";

// A disponibilidade do envio reflete as variáveis do servidor em tempo de execução.
export const dynamic = "force-dynamic";
export default function Home() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    ...(siteConfig.url ? { url: siteConfig.url } : {}),
    ...(siteConfig.email ? { email: siteConfig.email } : {}),
    ...(siteConfig.instagram ? { sameAs: [siteConfig.instagram] } : {}),
  };
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Services />
        <Process />
        <Plans />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
      <Reveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

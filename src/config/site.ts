function httpsUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href.replace(/\/$/, "") : undefined;
  } catch {
    return undefined;
  }
}
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") ?? "";
const email =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "comercial@degstudio.com.br";

export const siteConfig = {
  name: "D&G Studio",
  title: "D&G Studio | Sites, Sistemas e Experiências Digitais",
  description:
    "Criamos sites, landing pages, portfólios, e-commerce e sistemas web sob medida para pessoas, profissionais e empresas.",
  url: httpsUrl(process.env.NEXT_PUBLIC_SITE_URL),
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
  whatsapp: /^\d{10,15}$/.test(whatsapp) ? whatsapp : undefined,
  instagram: httpsUrl(process.env.NEXT_PUBLIC_INSTAGRAM),
};

export const whatsappUrl = "https://wa.me/message/4Q2K3QFUH6QUP1";

export const navigation = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Processo", href: "#processo" },
  { label: "Sobre", href: "#sobre" },
  { label: "Orçamento", href: "#orcamento" },
];

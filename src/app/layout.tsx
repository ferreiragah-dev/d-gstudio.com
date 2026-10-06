import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "./globals.css";
import "./portal.css";

const manrope = localFont({
  src: "../../assets/fonts/manrope-latin-wght-normal.woff2",
  display: "swap",
  variable: "--font-manrope",
  weight: "200 800",
});
export const viewport: Viewport = {
  themeColor: "#080b16",
  colorScheme: "dark",
};
export const metadata: Metadata = {
  title: { default: siteConfig.title, template: "%s | D&G Studio" },
  description: siteConfig.description,
  // Fallback apenas para a prévia local; o domínio de produção é configurável.
  metadataBase: new URL(siteConfig.url ?? "http://localhost:3000"),
  ...(siteConfig.url ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "pt_BR",
    type: "website",
    ...(siteConfig.url ? { url: siteConfig.url } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};
// Marca que há JavaScript antes da primeira pintura, para os cards de Serviços
// começarem escondidos sem "piscar". Se o JS do site não carregar em 4 s,
// a classe é removida e os cards voltam a aparecer normalmente.
const jsFlagScript = `(function(d){d.classList.add("js");setTimeout(function(){if(!d.hasAttribute("data-services-anim"))d.classList.remove("js")},4000)})(document.documentElement)`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: o script abaixo adiciona a classe "js" antes do React hidratar.
    <html lang="pt-BR" className={manrope.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: jsFlagScript }} />
        {children}
        <nav aria-label="Contato pelo WhatsApp">
          <WhatsAppFloat />
        </nav>
      </body>
    </html>
  );
}

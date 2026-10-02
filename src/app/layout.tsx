import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";
import "./globals.css";

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
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}

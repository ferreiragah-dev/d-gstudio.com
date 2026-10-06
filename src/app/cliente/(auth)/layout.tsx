import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="portal-auth">
      <header>
        <Link href="/" aria-label="D&G Studio — voltar ao site">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <div className="portal-auth-card">{children}</div>
      <Link href="/" className="text-link">
        ← Voltar ao site
      </Link>
    </main>
  );
}

"use client";
import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  CalendarDays,
  Layers3,
  PackageCheck,
  BadgeCheck,
  ClipboardList,
  Files,
  MessageSquare,
  WalletCards,
  LifeBuoy,
  UserRound,
  History,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Select } from "@/components/ui";
import { portalNavigation } from "@/config/portal";
import type { PortalProject, PortalUser } from "@/types/portal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Notifications } from "./notifications";
import { portalPost } from "./api";
const icons = {
  dashboard: LayoutDashboard,
  atualizacoes: History,
  projeto: FolderKanban,
  cronograma: CalendarDays,
  etapas: Layers3,
  entregas: PackageCheck,
  aprovacoes: BadgeCheck,
  solicitacoes: ClipboardList,
  arquivos: Files,
  mensagens: MessageSquare,
  financeiro: WalletCards,
  suporte: LifeBuoy,
  perfil: UserRound,
};
export function PortalShell({
  user,
  projects,
  children,
}: {
  user: PortalUser;
  projects: PortalProject[];
  children: React.ReactNode;
}) {
  const drawer = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const choosingProject =
    user.role === "team" && path === "/equipe" && !params.get("projeto");
  const selected =
    params.get("projeto") || (choosingProject ? "" : projects[0]?.id) || "";
  const project = projects.find((project) => project.id === selected);
  const links = (
    <>
      <Link href="/" className="portal-brand">
        <Logo />
        <small>PORTAL DO CLIENTE</small>
      </Link>
      <nav aria-label="Navegação do portal">
        {user.role === "team" && (
          <Link
            href="/equipe"
            aria-current={choosingProject ? "page" : undefined}
            onClick={() => drawer.current?.close()}
          >
            <FolderKanban size={16} aria-hidden="true" />
            Todos os projetos
          </Link>
        )}
        {portalNavigation
          .filter(
            (item) =>
              !choosingProject &&
              (item.section !== "financeiro" || project?.can_view_finance),
          )
          .map((item) => {
            const Icon = icons[item.section];
            return (
              <Link
                key={item.section}
                href={`/cliente/${item.section}${selected ? `?projeto=${selected}` : ""}`}
                aria-current={
                  path === `/cliente/${item.section}` ? "page" : undefined
                }
                onClick={() => drawer.current?.close()}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        {user.role === "team" && !choosingProject && (
          <Link href={`/equipe${selected ? `?projeto=${selected}` : ""}`}>
            <ShieldCheck size={16} />
            Administrar portal
          </Link>
        )}
      </nav>
      <div className="portal-sidebar-bottom">
        <Link href="/">Voltar ao site</Link>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await portalPost("auth/logout", {});
              router.replace("/cliente/login");
              router.refresh();
            } catch {
              router.refresh();
            }
          }}
        >
          <button type="submit">
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </>
  );
  return (
    <div className="portal-shell">
      <a href="#portal-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <aside className="portal-sidebar">{links}</aside>
      <dialog
        ref={drawer}
        className="portal-drawer"
        aria-label="Menu do portal"
        onClick={(event) => {
          if (event.target === event.currentTarget) drawer.current?.close();
        }}
      >
        <button
          type="button"
          className="portal-icon-button"
          aria-label="Fechar menu do portal"
          onClick={() => drawer.current?.close()}
        >
          <X />
        </button>
        {links}
      </dialog>
      <div className="portal-workspace">
        <header className="portal-topbar">
          <button
            type="button"
            className="portal-mobile-menu theme-toggle"
            aria-label="Abrir menu do portal"
            onClick={() => drawer.current?.showModal()}
          >
            <Menu size={19} />
          </button>
          {choosingProject ? (
            <div className="portal-current">
              <small>Administração</small>
              <strong>Todos os projetos</strong>
            </div>
          ) : projects.length > 1 ? (
            <Select
              id="project-switcher"
              label="Projeto atual"
              value={selected}
              onChange={(event) =>
                router.push(`${path}?projeto=${event.target.value}`)
              }
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          ) : (
            <div className="portal-current">
              <small>Projeto atual</small>
              <strong>{project?.name || "Seu espaço de projeto"}</strong>
            </div>
          )}
          <div className="portal-top-actions">
            <ThemeToggle />
            {project && (
              <Notifications key={project.id} projectId={project.id} />
            )}
            <Link
              href={`/cliente/perfil${selected ? `?projeto=${selected}` : ""}`}
              className="portal-avatar"
              aria-label={`Minha conta: ${user.name}`}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </header>
        <main id="portal-content" className="portal-content">
          {children}
        </main>
      </div>
    </div>
  );
}

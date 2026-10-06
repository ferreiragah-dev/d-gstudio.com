import { notFound } from "next/navigation";
import { pageUser } from "@/utils/portal/auth";
import {
  accessProject,
  listProjects,
  loadSection,
} from "@/utils/portal/projects";
import { PortalError } from "@/utils/portal/http";
import { uuid } from "@/utils/portal/validation";
import { portalNavigation } from "@/config/portal";
import { Dashboard } from "@/components/portal/dashboard";
import { SectionContent } from "@/components/portal/section-content";
import { EmptyState } from "@/components/portal/project-components";
import { ProfileForm } from "@/components/portal/profile-form";
import { ButtonLink } from "@/components/ui";
import { query } from "@/utils/portal/db";
import type { PortalProject, SectionData } from "@/types/portal";
export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section: raw } = await params;
  const navigation = portalNavigation.find((item) => item.section === raw);
  if (!navigation) notFound();
  const section = navigation.section;
  const user = await pageUser();
  const paramsQuery = await searchParams;
  const value = (name: string) =>
    typeof paramsQuery[name] === "string" ? (paramsQuery[name] as string) : "";
  if (section === "perfil") {
    const clients = await query<{ name: string }>(
      "SELECT c.name FROM clients c JOIN client_users cu ON cu.client_id=c.id WHERE cu.user_id=$1",
      [user.id],
    );
    return (
      <div className="portal-stack">
        <div className="portal-page-heading">
          <div>
            <span className="eyebrow">MINHA CONTA</span>
            <h1>Seu perfil</h1>
            <p>Mantenha seus dados e preferências atualizados.</p>
          </div>
        </div>
        <ProfileForm
          user={user}
          companies={clients.map((client) => client.name)}
        />
      </div>
    );
  }
  const projects = await listProjects(user);
  const selected = value("projeto") || projects[0]?.id;
  if (!selected)
    return (
      <EmptyState
        title="Seu espaço está pronto"
        description="Você ainda não possui um projeto vinculado. Nossa equipe irá disponibilizar seu projeto aqui."
      />
    );
  if (!uuid.safeParse(selected).success)
    return (
      <EmptyState
        title="Projeto inválido"
        description="Selecione um projeto no menu acima."
      />
    );
  const page = Math.min(
    100000,
    Math.max(1, Number.parseInt(value("pagina"), 10) || 1),
  );
  const itemId = uuid.safeParse(value("item")).success ? value("item") : "";
  let project: PortalProject | undefined;
  let data: SectionData | undefined;
  let denied = "";
  try {
    project = await accessProject(user, selected, section === "financeiro");
    data = await loadSection(
      user,
      project,
      section,
      page,
      value("busca").slice(0, 100),
      value("categoria").slice(0, 50),
      itemId,
    );
  } catch (error) {
    if (error instanceof PortalError && error.status === 403)
      denied = error.message;
    else throw error;
  }
  if (denied || !project || !data)
    return <EmptyState title="Acesso não permitido" description={denied} />;
  if (section === "dashboard")
    return <Dashboard user={user} project={project} data={data} />;
  const pagination = new URLSearchParams({ projeto: project.id });
  if (itemId) pagination.set("item", itemId);
  if (value("busca")) pagination.set("busca", value("busca"));
  if (value("categoria")) pagination.set("categoria", value("categoria"));
  const pageLink = (number: number) => {
    const params = new URLSearchParams(pagination);
    params.set("pagina", String(number));
    return `/cliente/${section}?${params}`;
  };
  return (
    <div className="portal-stack">
      <div className="portal-page-heading">
        <div>
          <span className="eyebrow">{project.name}</span>
          <h1>{navigation.label}</h1>
          <p>Seu projeto organizado, em um só lugar.</p>
        </div>
      </div>
      <SectionContent
        section={section}
        project={project}
        data={data}
        itemId={itemId}
        search={value("busca")}
        category={value("categoria")}
      />
      {(page > 1 || data.total > 20) && (
        <nav aria-label="Paginação" className="portal-row">
          {page > 1 && (
            <ButtonLink href={pageLink(page - 1)} variant="secondary">
              Anterior
            </ButtonLink>
          )}
          <span>Página {page}</span>
          {page * 20 < data.total && (
            <ButtonLink href={pageLink(page + 1)} variant="secondary">
              Próxima
            </ButtonLink>
          )}
        </nav>
      )}
    </div>
  );
}

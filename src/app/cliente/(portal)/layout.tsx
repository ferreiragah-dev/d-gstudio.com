import { pageUser } from "@/utils/portal/auth";
import { listProjects } from "@/utils/portal/projects";
import { PortalShell } from "@/components/portal/shell";
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser();
  const projects = await listProjects(user);
  return (
    <PortalShell user={user} projects={projects}>
      {children}
    </PortalShell>
  );
}

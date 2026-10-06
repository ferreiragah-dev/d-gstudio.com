import type { Metadata } from "next";
import { pageUser } from "@/utils/portal/auth";
import { listProjects } from "@/utils/portal/projects";
import { PortalShell } from "@/components/portal/shell";
export const metadata: Metadata = {
  title: "Equipe • Portal",
  robots: { index: false, follow: false },
};
export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser(true);
  const projects = await listProjects(user);
  return (
    <PortalShell user={user} projects={projects}>
      {children}
    </PortalShell>
  );
}

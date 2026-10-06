import { ButtonLink } from "@/components/ui";
import { RequestDialog } from "../actions";
import type { SectionProps } from "./types";
export function SupportPanel({ project }: SectionProps) {
  const link = (section: string) => `/cliente/${section}?projeto=${project.id}`;
  return (
    <section className="portal-card">
      <h2>Como podemos ajudar?</h2>
      <p>
        Converse com a equipe sobre o andamento do projeto ou registre uma
        solicitação com os detalhes do que precisa.
      </p>
      <div className="portal-row">
        <ButtonLink href={link("mensagens")}>Conversar com a equipe</ButtonLink>
        <RequestDialog
          projectId={project.id}
          title="Solicitar suporte"
          initialCategory="Bug"
        />
      </div>
    </section>
  );
}

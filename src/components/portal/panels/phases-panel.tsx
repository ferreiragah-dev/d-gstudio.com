import { ProjectStepper } from "../project-components";
import type { SectionProps } from "./types";
export function PhasesPanel({ data }: SectionProps) {
  return (
    <section className="portal-card">
      <ProjectStepper phases={data.phases || []} tasks={data.tasks} />
    </section>
  );
}

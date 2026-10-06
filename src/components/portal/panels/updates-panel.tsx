import { ProjectTimeline } from "../project-components";
import type { SectionProps } from "./types";
export function UpdatesPanel({ data }: SectionProps) {
  return (
    <section className="portal-card">
      <ProjectTimeline items={data.items} />
    </section>
  );
}

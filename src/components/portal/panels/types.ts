import type { PortalProject, PortalSection, SectionData } from "@/types/portal";
export type SectionProps = {
  section: PortalSection;
  project: PortalProject;
  data: SectionData;
  itemId?: string;
  search?: string;
  category?: string;
};

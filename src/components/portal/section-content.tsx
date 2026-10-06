import type { SectionProps } from "./panels/types";
import { UpdatesPanel } from "./panels/updates-panel";
import { ProjectDetails } from "./panels/project-details";
import { PhasesPanel } from "./panels/phases-panel";
import { SchedulePanel } from "./panels/schedule-panel";
import { FinancePanel } from "./panels/finance-panel";
import { SupportPanel } from "./panels/support-panel";
import { FilesPanel } from "./panels/files-panel";
import { MessagesPanel } from "./panels/messages-panel";
import { RequestsPanel } from "./panels/requests-panel";
import { DeliveriesPanel } from "./panels/deliveries-panel";
import { EmptyState } from "./project-components";
const panels = {
  atualizacoes: UpdatesPanel,
  projeto: ProjectDetails,
  etapas: PhasesPanel,
  cronograma: SchedulePanel,
  financeiro: FinancePanel,
  suporte: SupportPanel,
  arquivos: FilesPanel,
  mensagens: MessagesPanel,
  solicitacoes: RequestsPanel,
  entregas: DeliveriesPanel,
  aprovacoes: DeliveriesPanel,
};
export function SectionContent(props: SectionProps) {
  const Panel = panels[props.section as keyof typeof panels];
  return Panel ? <Panel {...props} /> : <EmptyState />;
}

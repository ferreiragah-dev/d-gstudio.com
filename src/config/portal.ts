import type { PortalSection } from "@/types/portal";
export const portalNavigation: { section: PortalSection; label: string }[] = [
  { section: "dashboard", label: "Visão geral" },
  { section: "atualizacoes", label: "Atualizações" },
  { section: "projeto", label: "Meu projeto" },
  { section: "cronograma", label: "Cronograma" },
  { section: "etapas", label: "Etapas" },
  { section: "entregas", label: "Entregas" },
  { section: "aprovacoes", label: "Aprovações" },
  { section: "solicitacoes", label: "Solicitações" },
  { section: "arquivos", label: "Arquivos" },
  { section: "mensagens", label: "Mensagens" },
  { section: "financeiro", label: "Financeiro" },
  { section: "suporte", label: "Suporte" },
  { section: "perfil", label: "Minha conta" },
];
export const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em desenvolvimento",
  completed: "Concluído",
  blocked: "Ação necessária",
  available: "Disponível para teste",
  approved: "Aprovado",
  revision_requested: "Ajuste solicitado",
  received: "Recebida",
  analysis: "Em análise",
  testing: "Em testes",
  rejected: "Rejeitada",
  waiting_client: "Aguardando cliente",
  paid: "Pago",
  cancelled: "Cancelado",
};
export const fileCategories = [
  "Documentos",
  "Contratos",
  "Design",
  "Identidade visual",
  "Entregas",
  "Conteúdo",
  "Outros",
] as const;
export const requestCategories = [
  "Design",
  "Funcionalidade",
  "Conteúdo",
  "Bug",
  "Integração",
  "Outro",
] as const;
export function projectProgress(
  phases: { status: string; completed_tasks: number; total_tasks: number }[],
) {
  if (!phases.length) return 0;
  const units = phases.reduce(
    (sum, phase) => sum + (Number(phase.total_tasks) || 1),
    0,
  );
  const completed = phases.reduce(
    (sum, phase) =>
      sum +
      (phase.status === "completed"
        ? Number(phase.total_tasks) || 1
        : Number(phase.completed_tasks)),
    0,
  );
  return Math.round((completed / units) * 100);
}
export function scheduleState(
  due: string | null | undefined,
  status: string,
  phases: { status: string; due_on?: string | null }[],
  today = new Date().toISOString().slice(0, 10),
) {
  if (status === "completed") return "Concluído";
  if (
    (due && due < today) ||
    phases.some(
      (phase) =>
        phase.status !== "completed" && phase.due_on && phase.due_on < today,
    )
  )
    return "Atrasado";
  if (
    status === "blocked" ||
    phases.some((phase) => phase.status === "blocked")
  )
    return "Atenção";
  return due ? "Dentro do cronograma" : "Prazo a definir";
}

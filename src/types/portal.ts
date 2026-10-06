export type PortalUser = {
  id: string;
  name: string;
  email: string;
  role: "client" | "team";
  phone: string;
  notifications_enabled: boolean;
  welcomed_at: string | null;
};
export type ProjectState = "pending" | "in_progress" | "completed" | "blocked";
export type PortalProject = {
  id: string;
  client_id: string;
  client_name: string;
  name: string;
  description: string;
  type: string;
  scope: string;
  status: ProjectState;
  starts_on: string | null;
  due_on: string | null;
  preview_url: string;
  public_url: string;
  updated_at: string;
  can_view_finance: boolean;
};
export type PortalRecord = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  created_at: string;
  [key: string]: string | number | boolean | null | undefined;
};
export type Phase = PortalRecord & {
  title: string;
  status: ProjectState;
  owner: string;
  starts_on: string | null;
  due_on: string | null;
  completed_on: string | null;
  notes: string;
  completed_tasks: number;
  total_tasks: number;
};
export type PortalSection =
  | "dashboard"
  | "atualizacoes"
  | "projeto"
  | "cronograma"
  | "etapas"
  | "entregas"
  | "aprovacoes"
  | "solicitacoes"
  | "arquivos"
  | "mensagens"
  | "financeiro"
  | "suporte"
  | "perfil";
export type SectionData = {
  items: PortalRecord[];
  total: number;
  page: number;
  phases?: Phase[];
  tasks?: PortalRecord[];
  milestones?: PortalRecord[];
  team?: PortalRecord[];
  approvals?: PortalRecord[];
  deliveries?: PortalRecord[];
  requests?: PortalRecord[];
  payments?: PortalRecord[];
  lastMessage?: PortalRecord;
  comments?: PortalRecord[];
  files?: PortalRecord[];
};

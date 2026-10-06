export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "number" | "select";
  options?: string[];
  optional?: boolean;
  relation?: string;
};
export type AdminEntity = {
  label: string;
  fields: AdminField[];
  editable: boolean;
};
const status: AdminField = {
  name: "status",
  label: "Status",
  type: "select",
  options: ["pending", "in_progress", "completed", "blocked"],
};
const title: AdminField = { name: "title", label: "Título" };
const description: AdminField = {
  name: "description",
  label: "Descrição",
  type: "textarea",
  optional: true,
};
const due: AdminField = { name: "due_on", label: "Previsão", type: "date" };
const url: AdminField = { name: "url", label: "Link HTTPS", optional: true };
export const adminEntities: Record<string, AdminEntity> = {
  phases: {
    label: "Etapas",
    editable: true,
    fields: [
      title,
      description,
      status,
      { name: "owner", label: "Responsável", optional: true },
      { name: "starts_on", label: "Início", type: "date", optional: true },
      { ...due, optional: true },
      {
        name: "completed_on",
        label: "Conclusão",
        type: "date",
        optional: true,
      },
      { name: "notes", label: "Observações", type: "textarea", optional: true },
      { name: "position", label: "Ordem", type: "number" },
    ],
  },
  tasks: {
    label: "Tarefas das etapas",
    editable: true,
    fields: [
      title,
      { name: "phase_id", label: "Etapa", type: "select", relation: "phases" },
      status,
    ],
  },
  milestones: {
    label: "Marcos do cronograma",
    editable: true,
    fields: [title, due, status],
  },
  members: {
    label: "Equipe do projeto",
    editable: true,
    fields: [
      { name: "name", label: "Nome" },
      { name: "role", label: "Função" },
    ],
  },
  deliveries: {
    label: "Entregas",
    editable: false,
    fields: [title, { name: "version", label: "Versão" }, description, url],
  },
  delivery_items: {
    label: "Itens de uma entrega",
    editable: false,
    fields: [
      title,
      {
        name: "delivery_id",
        label: "Entrega",
        type: "select",
        relation: "deliveries",
      },
    ],
  },
  approvals: {
    label: "Aprovações",
    editable: false,
    fields: [
      title,
      { name: "version", label: "Versão" },
      description,
      url,
      {
        name: "delivery_id",
        label: "Entrega relacionada",
        type: "select",
        relation: "deliveries",
        optional: true,
      },
    ],
  },
  updates: {
    label: "Atualizações",
    editable: false,
    fields: [
      title,
      description,
      {
        name: "type",
        label: "Tipo",
        type: "select",
        options: [
          "update",
          "delivery",
          "approval",
          "revision",
          "development",
          "publication",
          "client_request",
        ],
      },
      { name: "related_url", label: "Link relacionado HTTPS", optional: true },
    ],
  },
  payments: {
    label: "Parcelas",
    editable: true,
    fields: [
      title,
      { name: "amount_cents", label: "Valor em centavos", type: "number" },
      due,
      {
        name: "status",
        label: "Situação",
        type: "select",
        options: ["pending", "paid", "cancelled"],
      },
      { name: "paid_on", label: "Pago em", type: "date", optional: true },
    ],
  },
};
export const projectFields: AdminField[] = [
  { name: "name", label: "Nome do projeto" },
  description,
  { name: "type", label: "Tipo" },
  { name: "scope", label: "Escopo", type: "textarea", optional: true },
  status,
  { name: "starts_on", label: "Início", type: "date", optional: true },
  { ...due, optional: true },
  { name: "preview_url", label: "Link HTTPS de homologação", optional: true },
  { name: "public_url", label: "Link HTTPS publicado", optional: true },
];

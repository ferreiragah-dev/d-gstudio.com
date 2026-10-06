import "server-only";
import { z } from "zod";
import { adminEntities } from "@/config/portal-admin";
import { uuid } from "./validation";
const requiredText = z.string().trim().min(1).max(200);
const optionalText = z.string().trim().max(5000).default("");
const phaseStatus = z.enum(["pending", "in_progress", "completed", "blocked"]);
export const dateValue = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value);
    return (
      !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    );
  }, "Data inválida.");
const optionalDate = z
  .union([dateValue, z.literal("")])
  .nullable()
  .transform((value) => value || null);
export const httpsUrl = z
  .union([
    z.literal(""),
    z
      .url()
      .max(2000)
      .refine(
        (value) => new URL(value).protocol === "https:",
        "Use um link HTTPS.",
      ),
  ])
  .default("");
export const projectSchema = z
  .object({
    name: requiredText,
    description: optionalText,
    type: requiredText,
    scope: optionalText,
    status: phaseStatus,
    starts_on: optionalDate,
    due_on: optionalDate,
    preview_url: httpsUrl,
    public_url: httpsUrl,
  })
  .refine(
    (value) =>
      !value.starts_on || !value.due_on || value.starts_on <= value.due_on,
    "A previsão deve ser posterior ao início.",
  );
export const entitySchemas: Record<string, z.ZodType> = {
  phases: z
    .object({
      title: requiredText,
      description: optionalText,
      status: phaseStatus,
      owner: optionalText,
      starts_on: optionalDate,
      due_on: optionalDate,
      completed_on: optionalDate,
      notes: optionalText,
      position: z.coerce.number().int().min(0).max(1000),
    })
    .refine(
      (value) => value.status !== "completed" || !!value.completed_on,
      "Informe a data de conclusão.",
    ),
  tasks: z.object({ title: requiredText, phase_id: uuid, status: phaseStatus }),
  milestones: z.object({
    title: requiredText,
    due_on: dateValue,
    status: phaseStatus,
  }),
  members: z.object({ name: requiredText, role: requiredText }),
  deliveries: z.object({
    title: requiredText,
    version: requiredText,
    description: optionalText,
    url: httpsUrl,
  }),
  delivery_items: z.object({ title: requiredText, delivery_id: uuid }),
  approvals: z.object({
    title: requiredText,
    version: requiredText,
    description: optionalText,
    url: httpsUrl,
    delivery_id: z
      .union([uuid, z.literal("")])
      .transform((value) => value || null),
  }),
  updates: z.object({
    title: requiredText,
    description: z.string().trim().min(1).max(5000),
    type: z.enum([
      "update",
      "delivery",
      "approval",
      "revision",
      "development",
      "publication",
      "client_request",
    ]),
    related_url: httpsUrl,
  }),
  payments: z
    .object({
      title: requiredText,
      amount_cents: z.coerce.number().int().min(0).max(100000000000),
      due_on: dateValue,
      status: z.enum(["pending", "paid", "cancelled"]),
      paid_on: optionalDate,
    })
    .refine(
      (value) => value.status !== "paid" || !!value.paid_on,
      "Informe a data do pagamento.",
    ),
};
export function adminTable(entity: string) {
  if (!Object.hasOwn(adminEntities, entity)) return null;
  return `project_${entity}`;
}

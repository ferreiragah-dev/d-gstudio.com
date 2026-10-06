import { z } from "zod";
import { requestCategories } from "@/config/portal";
export const uuid = z.uuid("Selecione um registro válido.");
const text = (max = 200) =>
  z.string().trim().min(1, "Preencha este campo.").max(max);
export const newPassword = z
  .string()
  .min(12, "Use pelo menos 12 caracteres.")
  .max(128);
export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim().toLowerCase(),
  password: z.string().min(1).max(128),
  remember: z.boolean().default(false),
});
export const requestSchema = z.object({
  projectId: uuid,
  title: text(),
  category: z.enum(requestCategories),
  module: z.string().trim().max(200).default(""),
  client_priority: z.enum(["Baixa", "Normal", "Alta"]),
  description: text(5000),
});
export const approvalSchema = z
  .object({
    projectId: uuid,
    id: uuid,
    decision: z.enum(["approved", "revision_requested"]),
    comment: z.string().trim().max(3000).default(""),
  })
  .refine(
    (value) =>
      value.decision !== "revision_requested" || value.comment.length >= 5,
    { message: "Descreva o ajuste desejado.", path: ["comment"] },
  );
export const messageSchema = z.object({
  projectId: uuid,
  message: text(5000),
  requestId: uuid.optional(),
});
export const profileSchema = z.object({
  name: text(100),
  phone: z.string().trim().max(24),
  notifications_enabled: z.boolean(),
  currentPassword: z.string().max(128).default(""),
  password: z.union([z.literal(""), newPassword]).default(""),
});

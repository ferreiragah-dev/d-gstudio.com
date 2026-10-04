import { z } from "zod";
export const projectTypes = [
  "Site",
  "Landing Page",
  "Portfólio",
  "E-commerce",
  "Sistema Web",
  "Integração",
  "Manutenção",
  "Outro",
] as const;
export const budgets = [
  "Até R$ 1.500",
  "R$ 1.500 a R$ 3.000",
  "R$ 3.000 a R$ 5.000",
  "R$ 5.000 a R$ 10.000",
  "Acima de R$ 10.000",
  "Quero conversar primeiro",
] as const;
export const deadlines = [
  "O quanto antes",
  "Até 30 dias",
  "De 1 a 3 meses",
  "Mais de 3 meses",
  "Ainda não defini",
] as const;
export const quoteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome, com pelo menos 2 caracteres.")
    .max(100, "Use até 100 caracteres."),
  company: z.string().trim().max(150, "Use até 150 caracteres."),
  email: z.email("Informe um e-mail válido.").max(254),
  whatsapp: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^[+\d\s().-]+$/.test(value) &&
        value.replace(/\D/g, "").length >= 10 &&
        value.replace(/\D/g, "").length <= 15,
      "Informe um WhatsApp com DDD válido.",
    ),
  projectType: z.enum(projectTypes, { error: "Selecione o tipo de projeto." }),
  objective: z
    .string()
    .trim()
    .min(1, "Conte qual é o objetivo do projeto.")
    .max(500, "Use até 500 caracteres."),
  existingSite: z.enum(["Sim", "Não"], { error: "Selecione uma opção." }),
  deadline: z.enum(deadlines, { error: "Selecione o prazo desejado." }),
  budget: z.enum(budgets, { error: "Selecione uma faixa de investimento." }),
  description: z
    .string()
    .trim()
    .min(1, "Descreva brevemente o seu projeto.")
    .max(5000, "Use até 5.000 caracteres."),
  consent: z.literal(true, { error: "Autorize o contato para continuar." }),
  plan: z.enum(["", "Essencial", "Profissional", "Personalizado"]).default(""),
  website: z.string().max(0).default(""),
});
export type QuoteData = z.infer<typeof quoteSchema>;
export type QuoteResult = { status: "sent" | "draft"; message: string };

import type { Plan } from "@/types";
export const plans: Plan[] = [
  {
    name: "Essencial",
    badge: "Ideal para começar",
    description:
      "Solução prática e moderna para quem precisa de uma presença digital profissional.",
    features: ["Portfólio", "Página pessoal", "Landing page", "Site simples"],
    projectType: "Landing Page",
  },
  {
    name: "Profissional",
    badge: "Mais popular",
    description:
      "Para empresas que precisam de um site completo, estruturado e preparado para crescer.",
    features: [
      "Empresas",
      "Sites institucionais",
      "Sites empresariais",
      "Sites com várias páginas",
      "Blog",
      "SEO básico",
      "Integrações",
    ],
    featured: true,
    projectType: "Site",
  },
  {
    name: "Personalizado",
    badge: "Sob medida",
    description:
      "Soluções completas para projetos especiais e necessidades de maior complexidade.",
    features: [
      "E-commerce",
      "Sistemas Web",
      "Área de cliente",
      "Agendamento",
      "Integrações",
      "Projetos especiais",
    ],
    projectType: "Sistema Web",
  },
];

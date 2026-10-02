import {
  Globe2,
  MousePointer2,
  PanelsTopLeft,
  ShoppingBag,
  AppWindow,
  Workflow,
  Search,
  Wrench,
} from "lucide-react";
import type { Service } from "@/types";

export const services: Service[] = [
  {
    title: "Sites",
    description: "Institucionais, empresariais, pessoais e profissionais.",
    icon: Globe2,
  },
  {
    title: "Landing Pages",
    description: "Páginas focadas em conversão e resultados.",
    icon: MousePointer2,
  },
  {
    title: "Portfólios",
    description: "Portfólios profissionais para destacar seu trabalho.",
    icon: PanelsTopLeft,
  },
  {
    title: "E-commerce",
    description: "Lojas online modernas, rápidas e preparadas para vender.",
    icon: ShoppingBag,
  },
  {
    title: "Sistemas Web",
    description: "Soluções personalizadas para o seu negócio.",
    icon: AppWindow,
  },
  {
    title: "Integrações",
    description: "Conecte ferramentas, APIs e automatize processos.",
    icon: Workflow,
  },
  {
    title: "SEO",
    description:
      "Mais visibilidade e melhor posicionamento nos mecanismos de busca.",
    icon: Search,
  },
  {
    title: "Manutenção",
    description: "Suporte, atualizações e evolução contínua.",
    icon: Wrench,
  },
];

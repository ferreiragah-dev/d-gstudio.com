import type { Project } from "@/types";

// Conceitos demonstrativos, sem clientes ou resultados comerciais atribuídos.
export const projects: Project[] = [
  {
    id: "01",
    name: "Site Institucional",
    category: "Empresa",
    type: "Site",
    theme: "architecture",
    headline: "Espaços para viver.\nDesign para sentir.",
    description:
      "Conceito de site institucional para um estúdio de arquitetura. Tipografia editorial, composição leve e apresentação de serviços que valoriza cada detalhe.",
    tags: ["Design editorial", "Responsivo", "Institucional"],
  },
  {
    id: "02",
    name: "Landing Page",
    category: "Serviços",
    type: "Landing Page",
    theme: "wellness",
    headline: "Seu próximo passo\ncomeça aqui.",
    description:
      "Conceito de landing page para serviços de bem-estar. Uma jornada objetiva, com hierarquia clara e chamadas que facilitam o primeiro contato.",
    tags: ["Landing page", "Experiência do usuário", "Conversão"],
  },
  {
    id: "03",
    name: "Portfólio",
    category: "Fotografia",
    type: "Portfólio",
    theme: "photography",
    headline: "O extraordinário\nno cotidiano.",
    description:
      "Conceito de portfólio para fotografia. Uma direção visual sóbria que dá espaço às imagens e organiza séries e trabalhos autorais.",
    tags: ["Portfólio", "Direção de arte", "Galeria"],
  },
  {
    id: "04",
    name: "E-commerce",
    category: "Loja online",
    type: "E-commerce",
    theme: "store",
    headline: "Menos excesso.\nMais essência.",
    description:
      "Conceito visual de loja online para objetos de design. Produtos em destaque, navegação simples e uma experiência de compra pensada para todos os dispositivos.",
    tags: ["E-commerce", "Catálogo", "Design de produto"],
  },
];

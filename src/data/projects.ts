import type { Project } from "@/types";

// Conceitos demonstrativos com marcas fictícias, sem clientes ou resultados comerciais atribuídos.
export const projects: Project[] = [
  {
    id: "01",
    name: "Site Institucional",
    category: "Empresa",
    type: "Site",
    image: "/projects/site-institucional.svg",
    description:
      "Conceito de site institucional para a Verde Norte, uma consultoria fictícia. Apresentação clara dos serviços, números de destaque e uma identidade sóbria que transmite confiança.",
    tags: ["Institucional", "Responsivo", "Credibilidade"],
  },
  {
    id: "02",
    name: "Landing Page",
    category: "Tecnologia",
    type: "Landing Page",
    image: "/projects/landing-page.svg",
    description:
      "Conceito de landing page para o Fluxo, um aplicativo fictício de organização. Uma jornada objetiva, com chamada direta para o cadastro e benefícios fáceis de entender.",
    tags: ["Landing page", "Experiência do usuário", "Conversão"],
  },
  {
    id: "03",
    name: "Portfólio",
    category: "Estúdio criativo",
    type: "Portfólio",
    image: "/projects/portfolio.svg",
    description:
      "Conceito de portfólio para o lume®, um estúdio criativo fictício. Uma direção visual escura que dá destaque aos trabalhos e organiza projetos de branding, fotografia, editorial e web.",
    tags: ["Portfólio", "Direção de arte", "Galeria"],
  },
  {
    id: "04",
    name: "E-commerce",
    category: "Loja online",
    type: "E-commerce",
    image: "/projects/e-commerce.svg",
    description:
      "Conceito de loja online para a essenza, uma marca fictícia de objetos de decoração. Vitrine com filtros por categoria, produtos em destaque e uma compra simples em qualquer dispositivo.",
    tags: ["E-commerce", "Catálogo", "Design de produto"],
  },
];

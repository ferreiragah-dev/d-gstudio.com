# D&G Studio

Site institucional completo em português, com Next.js App Router, React, TypeScript, Tailwind CSS, Lucide e fonte Manrope local. Os dispositivos e os quatro conceitos de portfólio são feitos em HTML/CSS: sem imagens remotas, clientes inventados ou números comerciais fictícios. Animações leves em CSS e IntersectionObserver, com suporte a `prefers-reduced-motion`.

## Executar

Requisito: Node.js 20.9 ou superior (desenvolvido com Node 24).

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para produção:

```sh
npm run lint
npm run typecheck
npm run build
npm run start
```

## Estrutura e personalização

| Local | Conteúdo |
| --- | --- |
| `src/app/` | Página principal, layout, estilos, API, privacidade, 404 e SEO |
| `src/components/` | Componentes reutilizáveis e interativos |
| `src/sections/` | Hero, serviços, possibilidades, processo, planos, portfólio, sobre, orçamento e CTA |
| `src/data/services.ts` | Serviços, tipos de site e tipos de portfólio |
| `src/data/projects.ts` | Projetos, descrições, categorias e temas dos mockups |
| `src/data/plans.ts` | Categorias de orçamento, sem preços fixos |
| `src/types/index.ts` | Tipos de serviço, plano e projeto |
| `src/config/site.ts` | Marca, metadados, navegação e contatos validados |
| `src/components/logo.tsx` | Logo tipográfico usado no header e footer |
| `src/app/icon.svg` | Ícone do navegador |
| `src/app/opengraph-image.tsx` | Imagem de compartilhamento, também usada pelo Twitter |
| `src/app/globals.css` | Tokens, design system, componentes, mockups e breakpoints |
| `assets/fonts/` | Manrope variável local e licença OFL |
| `tests/site.spec.ts` | Testes de comportamento, responsividade, API e acessibilidade |

Componentes de base: `Button`, `ButtonLink`, `Container`, `SectionHeader`, `Badge`, `Input`, `Textarea`, `Select`. Conteúdo visual: `ServiceCard`, `ProjectCard`, `ProjectPreview`, `PlanCard`, `DeviceMockup`, `Logo`. Interações: `Header`, `QuoteForm`, `Reveal`.

## Contatos e domínio

Copie `.env.example` para `.env.local` e preencha somente dados reais:

- `NEXT_PUBLIC_SITE_URL`: domínio final HTTPS. Ativa canonical, URLs absolutas e sitemap. Sem domínio, o sitemap fica vazio, sem endereços fictícios.
- `NEXT_PUBLIC_WHATSAPP`: país + DDD + número, somente dígitos. Ativa os CTAs de WhatsApp.
- `NEXT_PUBLIC_CONTACT_EMAIL`: e-mail real. Ativa o contato por e-mail.
- `NEXT_PUBLIC_INSTAGRAM`: URL HTTPS completa do perfil real.

Contatos não configurados não geram links. Configure essas variáveis **antes do build**: variáveis `NEXT_PUBLIC_*` são incorporadas ao cliente. Execute novo build após alterá-las.

## Formulário de orçamento

O formulário é funcional, com validação no cliente e no servidor, feedback acessível, estados de envio, preservação dos campos em caso de falha, campo antispam e limite de corpo de 20 KB. Não registra conteúdo pessoal em logs nem usa armazenamento persistente no navegador.

**Por padrão, o envio real está desativado.** O site informa isso antes do preenchimento. A API valida o pedido e retorna `status: draft`. A pessoa pode baixar um resumo em `.txt`; não aparece uma confirmação falsa de recebimento.

Integração:

1. Configure `QUOTE_WEBHOOK_URL` com um endpoint HTTPS de n8n, CRM, API ou serviço de e-mail.
2. Opcionalmente configure `QUOTE_WEBHOOK_TOKEN`, transmitido como `Authorization: Bearer ...` somente pelo servidor.
3. O endpoint deve aceitar `POST` JSON e responder com HTTP 2xx **após aceitar o pedido**. Erros e timeouts mantêm os dados preenchidos e exibem tentativa novamente.
4. Para outro protocolo, edite `src/utils/quote-delivery.ts`. O cliente chama apenas `src/utils/submit-quote.ts`; schema e opções estão em `src/utils/quote-schema.ts`, a rota em `src/app/api/quote/route.ts`.

Payload:

```json
{
  "source": "dg-studio",
  "submittedAt": "ISO-8601",
  "quote": {
    "name": "...", "company": "...", "email": "...", "whatsapp": "...",
    "projectType": "Site", "objective": "...", "existingSite": "Não",
    "deadline": "Ainda não defini", "budget": "Quero conversar primeiro",
    "description": "...", "consent": true, "plan": "Profissional"
  }
}
```

Publicação: use um ambiente com runtime Node.js ou compatível com Next.js; não use exportação puramente estática por causa da API. Configure o proxy para preservar o host/origem públicos; o endpoint valida same-origin. Configure proteção de frequência no provedor/endpoint ao ativar o envio público. O adaptador não garante entrega de e-mail, tratamento de duplicatas ou retenção no CRM: essas responsabilidades pertencem ao endpoint integrado. Ajuste a página de privacidade aos serviços e prazos reais adotados antes de ativar o recebimento.

## Verificação

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

O Playwright inicia o servidor de produção automaticamente. O teste de rascunho pressupõe `QUOTE_WEBHOOK_URL` vazio. As capturas ficam em `test-results/site-390.png` e `test-results/site-1440.png`. Os testes percorrem 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px, verificam overflow, links internos, menu, diálogo, validação, erro, download, metadados, rotas e regras automáticas WCAG. Testes automáticos não substituem avaliação humana de acessibilidade.

Resultados da entrega e medição Lighthouse: [VALIDATION.md](./VALIDATION.md).

## Referências técnicas

- [Documentação oficial Next.js](https://nextjs.org/docs)
- [Tailwind com Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

Todos os arquivos deste repositório foram criados do zero: a pasta inicial estava vazia. O lockfile fixa as versões instaladas para builds reproduzíveis.

# Verificação da entrega

Executada em 1 de outubro de 2026, horário de São Paulo, sobre o build de produção local.

- `npm run lint`: aprovado, sem erros ou avisos.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado.
- `npm run test:e2e`: 6 testes aprovados.
- `npm audit --omit=dev`: nenhuma vulnerabilidade reportada.
- Revisão visual de capturas desktop e mobile realizada.

## Cobertura

Larguras de 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px, sem overflow horizontal. Verificados menu mobile, Escape, foco de teclado, diálogos dos quatro conceitos, seleção do tipo de projeto, links de seção, campos obrigatórios, falha de envio preservando os campos, modo rascunho, download, origem da API, limite de corpo, metadados, imagem social, privacidade e 404. Nenhum erro de console na página principal durante o teste responsivo.

O axe não reportou violações nas regras WCAG A/AA selecionadas e nas regras de boas práticas executadas, em desktop e mobile. Isso não equivale a uma certificação de acessibilidade.

## Lighthouse mobile

Medição local com Lighthouse 13.5, Chromium e build de produção:

| Categoria | Pontuação |
| --- | --- |
| Performance | 96 |
| Acessibilidade | 100 |
| Boas práticas | 100 |
| SEO | 100 |

Resultados de laboratório variam com máquina, hospedagem e rede. O relatório completo local está em `qa-reports/lighthouse-mobile.json`; as capturas de prévia estão em `qa-reports/`. Esses arquivos gerados são ignorados pelo Git. Capturas completas e rastros dos testes ficam em `test-results/`.

## Configuração restante para publicação

O código está compilado e pronto para hospedagem com Next.js/Node. Domínio, WhatsApp, e-mail, Instagram e destino de recebimento dependem dos dados reais da empresa. Nenhum contato foi inventado. Sem `QUOTE_WEBHOOK_URL`, o formulário informa a indisponibilidade de envio e oferece um resumo local. A entrega real ao CRM/e-mail não foi testada porque nenhum endpoint ou credencial foi fornecido. Consulte o README para ativar e validar essa integração.

## Atualização de deploy com Dockerfile

Adicionados Dockerfile em múltiplas etapas e `.dockerignore`, com Node 24 e saída standalone ativada somente no build do contêiner. Lint, typecheck e builds normal e standalone aprovados. O servidor standalone foi iniciado localmente e verificado com Chromium: página principal, oito serviços, arquivos estáticos, privacidade, imagem social e validação da API responderam corretamente, sem erros de página ou recursos HTTP.

A imagem Docker não pôde ser construída localmente: o Docker Desktop retornou HTTP 500 ao consultar o engine Linux. A validação do contêiner completo deverá ocorrer no deploy do Easypanel; o teste local validou o artefato standalone usado pela imagem.

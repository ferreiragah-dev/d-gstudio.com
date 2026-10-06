# Portal do Cliente — D&G Studio

## Arquitetura e integração

O site existente utiliza Next.js 16.3 App Router, React, TypeScript, Zod, CSS/Tailwind e Lucide. Não havia autenticação, banco, ORM nem administração. O módulo acrescenta PostgreSQL com `pg` (consultas parametrizadas e transações), mantendo as pastas e convenções do projeto. Não foi introduzido um ORM ou sistema visual paralelo.

`Button`, `ButtonLink`, `Input`, `Select`, `Textarea`, `Badge` e `Logo` são reutilizados. O portal usa a fonte Manrope local, as variáveis de tema, bordas e raios existentes. Os estilos do módulo estão isolados em `src/app/portal.css`; os dialogs seguem o padrão nativo já utilizado no portfólio. O site público mantém suas funcionalidades, com o novo acesso no menu e rodapé.

O controle de tema foi extraído para `src/components/theme-toggle.tsx`, compartilhado pelo site e pelo portal. A revisão também corrigiu dois contrastes existentes (texto da prévia do portfólio e opções vazias do formulário no tema claro), utilizando as cores já presentes no site.

| Local | Responsabilidade |
| --- | --- |
| `database/` | Migrações versionadas, entidades, vínculos e integridade entre projetos |
| `src/utils/portal/` | Autenticação, validação, acesso a dados, autorização, auditoria e SMTP |
| `src/app/api/portal/` | APIs de login, recuperação, ações, arquivos, notificações e administração |
| `src/app/cliente/(auth)/` | Login, recuperação e acesso negado |
| `src/app/cliente/(portal)/` | Rotas privadas e contexto de projeto |
| `src/app/equipe/` | Administração privada, exclusiva da equipe |
| `src/components/portal/` | Shell, formulários e componentes de apresentação |
| `tests/portal.spec.ts` | Testes com PostgreSQL, dois clientes e equipe |

## Configuração

Configure `DATABASE_URL` **somente no servidor**. A conexão recebida nesta sessão foi salva em `.env.local`, ignorado pelo Git; não há segredo no código ou `.env.example`.

```sh
npm ci
npm run portal:inspect
npm run portal:migrate
npm run build
npm run start
```

O script de migração usa transação, trava de execução e registro de versões. Na primeira aplicação, ele verifica conflitos de nomes e não reutiliza tabelas preexistentes sem revisão. Nenhum exemplo de cliente ou projeto é inserido pelas migrações.

No Easypanel, configure a mesma `DATABASE_URL` como variável de runtime do serviço. A imagem standalone contém o código do portal; aplique as migrações pelo checkout antes do deploy, ou por um job Node 24 que possua `database/`, `scripts/`, `src/utils/portal/password.ts` e as dependências instaladas. As credenciais não são necessárias durante o build. Use HTTPS no domínio, preserve o host público no proxy e configure `NEXT_PUBLIC_SITE_URL` antes do build.

Para recuperação de senha, configure também `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` e `NEXT_PUBLIC_SITE_URL`, como no envio de orçamento. Sem esses dados, o login funciona e a recuperação informa indisponibilidade. A entrega por SMTP depende do serviço de e-mail e precisa ser validada com uma caixa real após configurar.

## Primeiro acesso da equipe

Nesta implementação foi criado o acesso de equipe `comercial@degstudio.com.br`. A senha inicial aleatória está exclusivamente no arquivo local **`.env.portal-access.local`**, ignorado pelo Git. Entre por `/cliente/login`; usuários da equipe são direcionados para `/equipe`. Troque a senha em **Minha conta** após o primeiro acesso.

Em outro banco, crie uma conta de equipe definindo temporariamente `PORTAL_ADMIN_EMAIL`, `PORTAL_ADMIN_NAME` e `PORTAL_ADMIN_PASSWORD` (12–128 caracteres), e execute `npm run portal:create-team`. Remova a senha do ambiente após criar a conta. O script não sobrescreve contas existentes.

## Uso pela equipe

1. Cadastre um cliente e o acesso do usuário. Compartilhe a senha inicial por um canal privado.
2. Crie um projeto vinculado ao cliente; cadastre escopo, prazos e links HTTPS.
3. Adicione etapas, suas tarefas, marcos e membros responsáveis. O progresso é calculado pelas tarefas concluídas, com uma unidade para cada etapa sem tarefas.
4. Publique atualizações e entregas. Cada nova entrega cria uma aprovação vinculada automaticamente; os itens da entrega descrevem as alterações. Novas versões são registros novos, preservando o histórico.
5. Acompanhe solicitações, atualize status e prioridade interna, responda na conversa e compartilhe arquivos/mensagens.
6. Cadastre parcelas e conceda acesso financeiro somente aos vínculos que precisam dele. O valor do projeto corresponde à soma das parcelas não canceladas.

Um usuário pode participar de vários clientes e projetos. A equipe administra os vínculos e pode removê-los. Projetos sem dados exibem estados vazios. Se houver vários projetos, o seletor altera todo o contexto.

## Segurança e operação

- Sessões opacas de 256 bits, armazenadas no banco apenas como SHA-256. Cookies HttpOnly, SameSite=Lax e Secure em produção; nenhuma sessão em localStorage.
- Senhas com scrypt, salt aleatório e comparação de tempo constante. Recuperação usa token de uso único, prazo de 30 minutos e revoga sessões anteriores; o token fica no fragmento do link, sem constar no URL enviado ao servidor.
- Sem cadastro público. Apenas a equipe cria clientes e acessos. Layouts e páginas verificam sessão; cada leitura ou alteração de projeto verifica vínculos no servidor, inclusive downloads e financeiro.
- Validação Zod, origem verificada nas mutações, limites de payload e de frequência persistidos no PostgreSQL. Consultas usam parâmetros; tabelas/colunas administrativas vêm exclusivamente de listas do código.
- Aprovações são transacionais e não podem ser sobrescritas. São registrados usuário, horário, versão, decisão e comentário, além de eventos em `project_activity_log`.
- Arquivos ficam fora de `public/`, em BYTEA no banco: até 5 MB por arquivo e 100 MB por projeto. Extensões e assinaturas básicas são verificadas; HTML/SVG/executáveis são recusados. Downloads verificam propriedade; visualização usa CSP sandbox. Não há antivírus integrado; arquivos não são executados ou descompactados pelo servidor.
- Históricos têm páginas de 20 registros. Dashboard e notificações usam listas recentes limitadas. Notificações são geradas por eventos; lembretes de parcelas próximas são gerados ao abrir o portal, com deduplicação e checagem de permissão financeira. Não há integração de pagamento ou cron obrigatório.
- Mantenha backups do PostgreSQL, incluindo os anexos. Configure retenção conforme os contratos e execute periodicamente `node --env-file-if-exists=.env.local scripts/portal-db.mjs cleanup` para remover sessões, tokens e limites expirados.

## Verificação

```sh
npm run typecheck
npm run build
npm run test:e2e -- tests/portal.spec.ts
```

Os testes criam clientes/projetos temporários com identificadores aleatórios e removem os registros ao finalizar. Use preferencialmente um banco de testes com as mesmas migrações. Não há mocks permanentes no portal. A suíte verifica isolamento, permissões financeiras, login/logout, expiração e uso único de recuperação, aprovação/auditoria, anexos, mensagens, notificações, publicação administrativa, responsividade e acessibilidade. Capturas ficam em `test-results/portal-390.png` e `test-results/portal-1440.png`.

Referências: [consultas parametrizadas do pg](https://node-postgres.com/features/queries), [transações do pg](https://node-postgres.com/features/transactions), guias locais de autenticação, segurança de dados, cookies e rotas do Next.js em `node_modules/next/dist/docs/`.

# MoniTUR

Sistema para gestão, aplicação e monitoramento de pesquisas turísticas, com autenticação, dashboard administrativo e público para responder formulários.

## Visão geral

O projeto foi desenvolvido para apoiar a coleta, organização e análise de dados de pesquisas vinculadas a eventos, feiras, festivais e outros programas turísticos. Ele combina:

- painel administrativo para gerenciar pesquisas, formulários e usuários;
- formulários dinâmicos com diferentes tipos de perguntas;
- respostas registradas em banco relacional;
- visualização de indicadores em dashboard;
- autenticação por credenciais para acesso administrativo.

## Stack principal

- Next.js 15
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- Chart.js / Recharts
- shadcn/ui

## Funcionalidades implementadas

- cadastro e gerenciamento de pesquisas;
- criação de formulários por tipo (participante, expositor, organizador);
- definição de perguntas com tipos de resposta variados;
- suporte a perguntas com opções, múltipla escolha, localidade e grade multipla;
- armazenamento de respostas por formulário e por pesquisa;
- dashboard administrativo com métricas de usuários, pesquisas e respostas;
- listagem de pesquisas recentes;
- criação e gerenciamento de templates de formulários;
- autenticação de usuários administradores;
- geração de relatórios e visualizações analíticas no painel.

## Estrutura do projeto

```text
.
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── formularios/
│   │   │   ├── perfil/
│   │   │   ├── pesquisas/
│   │   │   ├── templates/
│   │   │   └── usuarios/
│   │   ├── api/
│   │   │   ├── account/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── pesquisas/
│   │   │   ├── public/
│   │   │   └── relatorios/
│   │   ├── responder/
│   │   │   └── [id]/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── navigation/
│   │   ├── public/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── pesquisa-options.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── types/
│       └── next-auth.d.ts
├── .env.example (se existir no ambiente local)
├── components.json
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── prisma/schema.prisma
```

## Modelo de dados principal

O Prisma define as entidades principais abaixo:

- User
  - usuário do sistema com login e papel
  - papéis: USER e ADMIN
- Pesquisa
  - pesquisa turística com categoria, status e dados gerais do projeto
  - categorias: EVENTOS, FEIRAS, FESTIVAL, MOTOCROSS, PESCA_ESPORTIVA
  - status: PLANEJADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO
- Formulario
  - formulário associado a uma pesquisa
  - tipos: PARTICIPANTE, EXPOSITOR, ORGANIZADOR
- Pergunta
  - pergunta dinâmica do formulário
  - tipos de resposta: TEXTO, NUMERO, OPCAO, MULTIPLA, LOCALIDADE_MUNICIPIO, GRADE_MULTIPLA_ESCOLHA
- Resposta
  - conjunto de respostas enviadas para um formulário
- RespostaDetalhe
  - valores individuais por pergunta respondida
- FormularioTemplate e PerguntaTemplate
  - modelos reutilizáveis para padronizar formulários

## Requisitos

Antes de iniciar, confirme que o ambiente local possui:

- Node.js 20+
- pnpm
- PostgreSQL disponível
- Docker Desktop (recomendado) ou PostgreSQL disponível localmente

Para preparar uma máquina sem internet, faça a instalação das dependências e o
download das imagens Docker enquanto houver conexão. Depois disso, a aplicação
funciona integralmente em `localhost`, sem chamadas a serviços externos.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/monitur"
APP_PORT="3000"
NEXTAUTH_SECRET="gere-um-segredo-forte"
NEXTAUTH_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@exemplo.com"
SEED_ADMIN_PASSWORD="senha-forte"
POSTGRES_USER="monitur"
POSTGRES_PASSWORD="monitur"
POSTGRES_DB="monitur"
```

Observações:

- `DATABASE_URL` deve apontar para o banco PostgreSQL do projeto. No Docker, o Compose configura automaticamente o host `db`.
- `NEXTAUTH_SECRET` é obrigatório para autenticação.
- `NEXTAUTH_URL` deve refletir a URL em que a aplicação está sendo executada.
- `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` são usados para criar o usuário administrador inicial.

## Instalação e execução local

### Usando Docker (recomendado para operação offline)

Crie o arquivo `.env` conforme a seção de variáveis e execute:

```bash
docker compose up -d --build
docker compose exec app pnpm run db:seed
```

O banco de dados fica persistido no volume local `db_data`. Para iniciar a
aplicação posteriormente sem internet, use `docker compose up -d`.

### Usando Node.js e PostgreSQL locais

Instale as dependências:

```bash
pnpm install
```

Aplique as migrations do Prisma:

```bash
pnpm run db:deploy
```

Crie o usuário administrador inicial:

```bash
pnpm run db:seed
```

Inicie a aplicação em desenvolvimento:

```bash
pnpm dev
```

A aplicação ficará disponível em ambos os modos em:

```text
http://localhost:3000
```

## Scripts disponíveis

No arquivo `package.json`, os scripts principais são:

```json
{
  "dev": "next dev",
  "build": "prisma migrate deploy && prisma generate && next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate",
  "db:deploy": "prisma migrate deploy",
  "db:seed": "prisma db seed"
}
```

## Fluxo administrativo

A área administrativa está organizada em rotas do App Router, incluindo:

- `/dashboard` — painel principal com estatísticas e visão geral;
- `/pesquisas` — gestão de pesquisas;
- `/formularios` — criação e manutenção de formulários;
- `/templates` — modelos de formulários reutilizáveis;
- `/usuarios` — controle de usuários do sistema;
- `/perfil` — perfil do usuário autenticado.

Além disso, a aplicação pública possui o fluxo de resposta em:

- `/responder/[id]` — formulário público para coleta de respostas.

## Autenticação

A autenticação é feita com NextAuth utilizando credenciais e JWT.

Arquivo principal:

- `src/lib/auth.ts`

O login usa e-mail e senha do usuário e valida as credenciais contra o banco via Prisma. O padrão de sessão e as regras de acesso ficam centralizadas no arquivo de autenticação.

## Operação offline

- O login, o painel administrativo, a criação de pesquisas e o registro de respostas usam apenas a aplicação e o PostgreSQL locais.
- A lista de estados é embutida no sistema.
- O município é digitado diretamente no formulário, portanto a coleta não depende da API do IBGE.
- Não há fonte, CDN, mapa ou API externa necessária para executar o fluxo de pesquisa.

## Deploy

Para deploy em ambiente de produção, configure as variáveis de ambiente do projeto no provedor de hospedagem:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

O comando de build do projeto já executa migrations antes de compilar:

```bash
pnpm build
```

Em ambientes baseados em Prisma/Next.js, normalmente a estratégia é:

1. configurar `DATABASE_URL` da aplicação;
2. garantir que o banco esteja acessível;
3. rodar `pnpm install`;
4. rodar `pnpm run db:deploy` se necessário;
5. executar `pnpm build`;
6. iniciar o app com `pnpm start`.

> O seed administrativo deve ser executado de forma consciente, normalmente apenas uma vez no ambiente inicial, e não como parte do processo de build em produção.

## Observações importantes

- O projeto usa App Router do Next.js;
- a lógica de dados e regras de negócio são abstraídas pelo Prisma;
- a UI foi construída com componentes reutilizáveis e Tailwind;
- a arquitetura está preparada para expansão em módulos de pesquisa, relatórios e integrações futuras.

## Autor e contexto

Este projeto foi estruturado para atender necessidades de monitoramento e avaliação de ações turísticas, com foco em dados qualitativos e quantitativos coletados em pesquisas de público, expositor e organizador.


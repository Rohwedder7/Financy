# Setup local

## Pré-requisitos

- Node.js `24.19.x` (consulte `.nvmrc`).
- Corepack e pnpm `11.19.0`.
- Git.

## Primeira execução

```bash
corepack enable
pnpm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Ou, depois de copiar os `.env`, `pnpm setup` (install + generate + migrate).

Frontend: `http://localhost:5173`. GraphQL: `http://localhost:3000/graphql`.

## Variáveis

Backend: `JWT_SECRET`, `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `JWT_EXPIRES_IN`, `JWT_ISSUER`, `JWT_AUDIENCE`. Frontend: `VITE_BACKEND_URL`. Gere um segredo longo e aleatório; nunca copie o valor de teste para produção.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `pnpm verify` | docs, lint, tipos, testes e build |
| `pnpm test:e2e` | fluxos backend e navegador |
| `pnpm db:generate` | gerar Prisma Client |
| `pnpm db:migrate` | criar/aplicar migration local |
| `pnpm format` | formatar arquivos suportados |

## Problemas comuns

- Prisma sem `DATABASE_URL`: confirme `backend/.env` e o diretório do comando.
- CORS no navegador: `CORS_ORIGIN` deve corresponder exatamente ao frontend.
- Schema desatualizado: execute `pnpm db:generate` após mudar `schema.prisma`.

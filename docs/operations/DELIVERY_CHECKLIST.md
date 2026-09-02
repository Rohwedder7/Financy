# Checklist de entrega

## Repositório

- [x] Repositório público com `backend/` e `frontend/` (`https://github.com/Rohwedder7/Financy`).
- [x] Branch principal contém somente requisitos obrigatórios.
- [x] Histórico sem `.env`, banco, tokens ou arquivos gerados pesados (`pnpm secrets:scan` / `pnpm docs:validate`).
- [x] README reproduz uma instalação limpa.

## Funcional

- [x] Cadastro, login, logout e `me`.
- [x] CRUD completo de categorias.
- [x] CRUD completo de transações.
- [x] Dashboard e navegação autenticada (tokens provisórios; comparação Figma na SPEC-011).
- [x] Isolamento usuário A/B demonstrado.

## Técnico

- [x] TypeScript, React, Vite, GraphQL, Prisma e SQLite confirmados.
- [x] CORS e `.env.example` configurados.
- [x] Migration inicial versionada.
- [x] `pnpm verify` e `pnpm test:e2e` verdes localmente.
- [x] CI verde em clone limpo ([run 33580037626](https://github.com/Rohwedder7/Financy/actions/runs/33580037626); `pnpm verify` + `pnpm test:e2e`).

## Evidência

- [x] Matriz de rastreabilidade sem lacunas silenciosas (`OPEN-UI-001` explícito).
- [ ] SPECs concluídas movidas para `specs/completed` (SPEC-012 ainda ativa; SPEC-011 bloqueada).
- [ ] Screenshots comparativos com os nós Figma (`OPEN-UI-001`).
- [ ] Link público testado em janela anônima antes do envio.

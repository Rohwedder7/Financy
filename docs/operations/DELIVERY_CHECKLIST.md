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
- [x] Dashboard e navegação autenticada (Style Guide na SPEC-011; desvios Figma documentados).
- [x] Isolamento usuário A/B demonstrado.

## Técnico

- [x] TypeScript, React, Vite, GraphQL, Prisma e SQLite confirmados.
- [x] CORS e `.env.example` configurados.
- [x] Migration inicial versionada.
- [x] `pnpm verify` e `pnpm test:e2e` verdes localmente.
- [x] CI verde em clone limpo ([run 33580037626](https://github.com/Rohwedder7/Financy/actions/runs/33580037626); `pnpm verify` + `pnpm test:e2e`).

## Evidência

- [x] Matriz de rastreabilidade sem lacunas silenciosas (`OPEN-UI-001` explícito).
- [x] SPECs 001–012 em `specs/completed`.
- [x] Screenshots comparativos com os nós Figma ([visual/COMPARISON.md](../product/visual/COMPARISON.md); `OPEN-UI-001` aceito no inspect Dev Mode).
- [x] Repositório público visível sem autenticação: [Rohwedder7/Financy](https://github.com/Rohwedder7/Financy) (`visibility: public`, 2026-09-02).

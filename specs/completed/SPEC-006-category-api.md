---
id: SPEC-006
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Backend
depends-on: [SPEC-004]
---

# SPEC-006 — CRUD GraphQL de categorias

## Objetivo

Fornecer CRUD completo de categorias com isolamento por proprietário.

## Referências

RF-CAT-001..004; BR-CAT-001..004, BR-SEC-001..004, BR-LIST-001.

## Escopo

- Query `categories`; mutations create/update/delete e validações.
- Ordenação, unicidade normalizada, cor válida e bloqueio `CATEGORY_IN_USE`.
- Testes explícitos usuário A/B em toda operação por ID.

## Fora do escopo

Categorias globais, ícones e ordenação manual.

## Critérios de aceite

- **AC-001:** lista contém somente categorias do principal e vem ordenada.
- **AC-002:** outro usuário recebe `NOT_FOUND` ao editar/excluir por ID conhecido.
- **AC-003:** nome duplicado gera `CONFLICT`; categoria usada não é excluída.

## Verificação

`pnpm --filter backend test && pnpm --filter backend test:e2e`

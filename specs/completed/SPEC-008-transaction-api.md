---
id: SPEC-008
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Backend
depends-on: [SPEC-002, SPEC-004, SPEC-006]
---

# SPEC-008 — CRUD GraphQL de transações

## Objetivo

Fornecer CRUD de receitas/despesas com cálculo monetário exato e isolamento.

## Referências

RF-TXN-001..004; BR-TXN-001..005, BR-MONEY-001, BR-SEC-001..004, BR-LIST-001.

## Escopo

- Query `transactions`; mutations create/update/delete.
- Validar centavos, tipo, data, descrição e categoria do mesmo usuário.
- Ordenação determinística e testes usuário A/B, inclusive categoria cruzada.

## Fora do escopo

Parcelamento, recorrência, anexos, filtros e paginação.

## Critérios de aceite

- **AC-001:** valor decimal/negativo/zero não atravessa o contrato em centavos.
- **AC-002:** categoria alheia retorna erro genérico sem criar/alterar transação.
- **AC-003:** operação por ID de outro usuário retorna `NOT_FOUND` e não muda dados.

## Verificação

`pnpm --filter backend test && pnpm --filter backend test:e2e`

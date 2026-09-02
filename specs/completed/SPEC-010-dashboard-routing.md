---
id: SPEC-010
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Fullstack
depends-on: [SPEC-005, SPEC-008, SPEC-009]
---

# SPEC-010 — Dashboard e navegação autenticada

## Objetivo

Entregar a raiz contextual e o resumo financeiro correto do usuário.

## Referências

RF-DASH-001, RF-NAV-001; BR-DASH-001/002, BR-MONEY-001; RNF-SEC-001.

## Decisão

Em 2026-09-01 o product owner autorizou UI sem `node-id` Figma. Esta SPEC reutiliza os tokens provisórios e as rotas já usadas ( `/`, `/cadastro`, `/transacoes`, `/categorias` ). Comparação visual (`RNF-UX-001`, `OPEN-UI-001`) permanece na SPEC-011. Não inventar a sexta página.

## Escopo

- Query `dashboard` com saldo, receitas e despesas em centavos.
- Shell autenticado, rotas conhecidas do Figma e comportamento `/` visitante/autenticado.
- Cards e movimentações recentes com estados de dados.

## Fora do escopo

Gráficos analíticos, metas e filtros por período não representados.

## Contratos e dados

```graphql
type Dashboard {
  balanceInCents: Int!
  expenseInCents: Int!
  incomeInCents: Int!
}

type Query {
  dashboard: Dashboard!
}
```

`dashboard` é autenticada. Totais usam somente transações do JWT (`BR-SEC-001`, `BR-DASH-001`). `balanceInCents = incomeInCents - expenseInCents` em inteiros (`BR-MONEY-001`). Sem transações os três campos são `0` (`BR-DASH-002`). Movimentações recentes continuam na query `transactions`.

## Critérios de aceite

- **AC-001:** resumo usa somente dados do principal e saldo é receita menos despesa.
- **AC-002:** sem transações retorna zeros e estado vazio útil.
- **AC-003:** visitante não acessa rotas privadas; logout volta ao login.

## Verificação

`pnpm verify && pnpm test:e2e`

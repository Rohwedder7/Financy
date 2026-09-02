---
id: SPEC-009
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Frontend
depends-on: [SPEC-007, SPEC-008]
---

# SPEC-009 — Interface e dialog de transações

## Objetivo

Permitir CRUD de transações com entrada monetária segura e feedback completo.

## Referências

RF-TXN-001..004; BR-TXN-001..005, BR-MONEY-001; RNF-A11Y-001.

## Decisão

Em 2026-09-01 o product owner autorizou UI sem `node-id` Figma (SPEC-007). Esta SPEC reutiliza os tokens provisórios. Comparação visual (`RNF-UX-001`, `OPEN-UI-001`) permanece na SPEC-011. Totais oficiais via query `dashboard` permanecem na SPEC-010; o dashboard só consome a mesma query de transações para não duplicar linhas após editar/excluir.

## Escopo

- Listagem e dialog criar/editar com descrição, valor, tipo, data e categoria.
- Conversão testada entre string localizada e centavos; confirmação de exclusão.
- Loading, vazio, erro, cache e acessibilidade.

## Fora do escopo

Filtros avançados, upload, recorrência, paginação e fidelidade pixel a pixel com o Figma.

## Critérios de aceite

- **AC-001:** `10,05` é enviado como `1005` e renderizado sem erro de precisão.
- **AC-002:** categoria é obrigatória e opções vêm somente da sessão atual.
- **AC-003:** editar/excluir atualiza lista e dashboard sem duplicações.

## Verificação

`pnpm --filter frontend test && pnpm --filter frontend test:e2e`

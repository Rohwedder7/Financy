---
id: SPEC-011
status: blocked
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Frontend + Design
depends-on: [SPEC-007, SPEC-009, SPEC-010, OPEN-UI-001]
---

# SPEC-011 — Fidelidade Figma e responsividade

## Objetivo

Consolidar style guide, seis páginas e dois dialogs com fidelidade mensurável e acessibilidade.

## Referências

RNF-UX-001, RNF-A11Y-001; `docs/product/FIGMA_INVENTORY.md`.

## Bloqueio

`OPEN-UI-001`: faltam links diretos dos nós internos. A SPEC não pode entrar em `active` até a lista de telas e seus node IDs ser validada.

## Escopo

- Extrair tokens/asset reais, implementar componentes e estados responsivos.
- Comparação visual desktop/mobile por tela e auditoria teclado/foco/contraste.
- Documentar desvios necessários por conteúdo ou acessibilidade.

## Fora do escopo

Inventar sexta página, redimensionar assets por suposição ou criar um novo design.

## Critérios de aceite

- **AC-001:** cada tela/dialog possui link de nó, screenshot de referência e evidência local.
- **AC-002:** tokens não estão duplicados em componentes e estados interativos são perceptíveis.
- **AC-003:** fluxos críticos são operáveis a 320 px, desktop, zoom 200% e somente teclado.

## Verificação

`pnpm --filter frontend test && pnpm --filter frontend test:e2e`

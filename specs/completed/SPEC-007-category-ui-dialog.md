---
id: SPEC-007
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Frontend
depends-on: [SPEC-005, SPEC-006]
---

# SPEC-007 — Interface e dialog de categorias

## Objetivo

Permitir listar, criar, editar e excluir categorias pela interface, com dialog acessível e cache GraphQL consistente.

## Referências

RF-CAT-001..004; BR-CAT-001..004; RNF-A11Y-001.

## Decisão

Em 2026-09-01 o product owner autorizou seguir **sem** `node-id` Figma: tokens provisórios já isolados no CSS, hierarquia funcional. Comparação visual com os nós (`RNF-UX-001`, `OPEN-UI-001`) permanece na SPEC-011. Esta SPEC não inventa o Style Guide nem assets da capa.

## Escopo

- Página/listagem, estados loading/vazio/erro e dialog reutilizado para criar/editar.
- Confirmação de exclusão, feedback GraphQL e atualização consistente do cache.

## Fora do escopo

Drag-and-drop, categorias sugeridas e fidelidade pixel a pixel com o Figma.

## Critérios de aceite

- **AC-001:** CRUD completo sem recarregar a página e com falhas preservando o formulário.
- **AC-002:** dialog prende/restaura foco, fecha com Escape e possui nome acessível.
- **AC-003:** exclusão bloqueada por uso explica a ação possível ao usuário.

## Verificação

`pnpm --filter frontend test && pnpm --filter frontend test:e2e`

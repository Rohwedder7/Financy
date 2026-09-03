---
id: SPEC-011
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Frontend + Design
depends-on: [SPEC-007, SPEC-009, SPEC-010]
---

# SPEC-011 — Fidelidade Figma e responsividade

## Objetivo

Aplicar o Style Guide e o layout das telas obrigatórias com tokens únicos, estados visíveis e operação em 320 px / teclado.

## Referências

RNF-UX-001, RNF-A11Y-001; `docs/product/FIGMA_INVENTORY.md`.

## Decisão (2026-09-02)

O product owner pediu seguir o desenvolvimento após a cópia `Sj0a8DSgyFq1tbAUyLadwz`. Desvios explícitos (PRD prevalece):

- Sem gráfico, orçamento ou filtros avançados.
- Sem página Perfil e sem upload de avatar.
- Sem recriar o logotipo/ícones do Figma (assets não exportados); wordmark tipográfico.
- Login/cadastro, dashboard, transações, categorias e os dois dialogs usam os nós listados no inventário.

`OPEN-UI-001` fecha com capturas canvas × app em `docs/product/visual/COMPARISON.md`. Hex vieram dos swatches rotulados do Style Guide. O inspect Dev Mode de variáveis exportadas permanece limitação aceita (sem PAT/MCP Figma nesta entrega).

## Escopo

- Tokens do Style Guide isolados em CSS; componentes reutilizam esses tokens.
- Layout das rotas já existentes e dos dialogs, com foco/hover/disabled perceptíveis.
- Responsividade e teclado nos fluxos críticos.

## Fora do escopo

Inventar Perfil, gráfico, filtros, ícones desenhados à mão ou um design novo.

## Critérios de aceite

- **AC-001:** cada tela/dialog implementado aponta para o `node-id` no inventário; desvios documentados.
- **AC-002:** hex de marca/cinza/feedback existem numa única fonte; botão, campo e dialog reutilizam tokens; foco visível.
- **AC-003:** login e dashboard operam a 320 px e por teclado (e2e existente + viewport estreito).

## Verificação

```bash
pnpm --filter frontend test && pnpm --filter frontend test:e2e
```

## Definition of Done

- [x] Critérios automatizados.
- [x] Documentação e rastreabilidade atualizadas.
- [x] Sem mudança fora do escopo.

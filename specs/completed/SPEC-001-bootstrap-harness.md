---
id: SPEC-001
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Engineering
depends-on: []
---

# SPEC-001 — Fundação executável e harness

## Objetivo

Disponibilizar um monorepo instalável com frontend, backend GraphQL, Prisma, documentação rastreável e gates automatizados, sem antecipar funcionalidades do produto.

## Referências

RNF-TECH-001..004, RNF-OPS-001/002, RNF-QA-001; ADR-0001, ADR-0002, ADR-0004, ADR-0005.

## Escopo

- Workspace pnpm, versões fixas e scripts raiz.
- NestJS com CORS, configuração, Prisma e query pública `health`.
- React/Vite/Tailwind com tela de fundação e testes.
- `.env.example`, CI, BND, PRD, regras, ADRs e SPECs pequenas.
- Claude Code rules, agents e skills locais.

## Fora do escopo

Cadastro, login e CRUDs; qualquer tela final além da fundação.

## Critérios de aceite

- **AC-001:** dado um clone limpo, quando o setup documentado é executado, então dependências e Prisma Client são gerados sem edição manual.
- **AC-002:** quando `pnpm verify` é executado, então docs, lint, tipos, testes e builds passam.
- **AC-003:** quando a query `{ health }` é enviada, então a API responde `ok`.
- **AC-004:** nenhum segredo, banco ou artefato de build integra a entrega.

## Verificação

```bash
pnpm install
pnpm db:generate
pnpm verify
pnpm test:e2e
```

## Definition of Done

- [x] Todos os critérios comprovados.
- [x] `OPEN-UI-001` documentado, sem UI inventada.
- [x] SPEC movida para `completed` somente após revisão.

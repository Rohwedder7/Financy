---
id: SPEC-012
status: approved
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Fullstack
depends-on: [SPEC-003, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010]
---

# SPEC-012 — Hardening, CI e entrega

## Objetivo

Provar que a solução completa é segura, reproduzível e pronta para correção pública.

## Referências

Todos os RF/RNF P0; BR-SEC-001..004; `DELIVERY_CHECKLIST.md`.

## Decisão

Em 2026-09-01 o product owner autorizou seguir a entrega com `OPEN-UI-001` / SPEC-011 ainda bloqueada. `RNF-UX-001` permanece residual na matriz; esta SPEC não inventa nós Figma nem marca evidência visual como verde.

## Escopo

- Fechar testes unidade/integração/E2E, auditoria de IDOR e acessibilidade já coberta.
- CI em clone limpo, migrations, documentação final e checklist.
- Revisar segredos, CORS, logs, dependências, erros GraphQL e instruções de instalação.

## Fora do escopo

Deploy, observabilidade paga, funcionalidades opcionais e fidelidade pixel a pixel com o Figma (SPEC-011).

## Critérios de aceite

- **AC-001:** `pnpm verify` e `pnpm test:e2e` passam localmente e o workflow de CI executa os dois.
- **AC-002:** matriz liga todos os requisitos obrigatórios a evidência, com `RNF-UX-001` explícito como `OPEN-UI-001`.
- **AC-003:** busca de segredos e arquivos proibidos não encontra material de usuário.
- **AC-004:** clone limpo instala pelas instruções do README (Node 24.19.x, pnpm, `.env.example`, generate/migrate).

## Verificação

```bash
pnpm install
pnpm db:generate
pnpm verify
pnpm test:e2e
```

---
id: SPEC-002
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Backend
depends-on: [SPEC-001]
---

# SPEC-002 — Modelo e migration financeira

## Objetivo

Materializar User, Category e Transaction em uma migration SQLite reproduzível.

## Referências

BR-AUTH-001, BR-CAT-001, BR-TXN-001..004, BR-MONEY-001; ADR-0002/0006.

## Escopo

- Revisar schema, criar migration inicial e factories de teste.
- Garantir chaves, índices, unicidade por usuário e política de exclusão.

## Fora do escopo

Resolvers e seed com credenciais conhecidas.

## Critérios de aceite

- **AC-001:** banco vazio migra e Prisma Client gera em clone limpo.
- **AC-002:** duplicidade de e-mail/categoria é rejeitada no banco.
- **AC-003:** valor monetário não aceita representação decimal no modelo.

## Verificação

`pnpm db:migrate && pnpm --filter backend test`

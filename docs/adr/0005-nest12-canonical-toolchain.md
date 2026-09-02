# ADR 0005 — Toolchain canônico do NestJS 12

Status: aceito — 2026-08-31

## Contexto

O scaffold oficial atual usa ESM, TypeScript 6, Vitest e Oxlint.

## Decisão

Preservar o toolchain gerado e alinhar o frontend ao Vitest. Não converter para CommonJS, Jest ou ESLint sem necessidade demonstrada.

## Consequências

Menor divergência da documentação contemporânea e testes mais uniformes. Exemplos antigos podem precisar adaptação de imports e mocks.

---
id: SPEC-003
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Backend
depends-on: [SPEC-002]
---

# SPEC-003 — Cadastro pela API

## Objetivo

Permitir conta única e segura pela mutation `signUp`.

## Referências

RF-AUTH-001; BR-AUTH-001/002/004/005/006; RNF-SEC-002.

## Escopo

- Validar nome, e-mail e força mínima da senha.
- Normalizar e-mail, gerar Argon2id e retornar `AuthPayload` com JWT e usuário seguro.
- Rate limit e tratamento `CONFLICT` sem vazar hash.

## Fora do escopo

Verificação de e-mail, recuperação de senha e avatar.

## Critérios de aceite

- **AC-001:** cadastro válido persiste hash diferente da senha e cria sessão.
- **AC-002:** e-mail equivalente em caixa/espaços não cria segunda conta.
- **AC-003:** resposta e logs nunca contêm senha ou hash.

## Verificação

`pnpm --filter backend test && pnpm --filter backend test:e2e`

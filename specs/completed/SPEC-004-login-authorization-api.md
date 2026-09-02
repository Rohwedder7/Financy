---
id: SPEC-004
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Backend
depends-on: [SPEC-003]
---

# SPEC-004 — Login e autorização GraphQL

## Objetivo

Autenticar credenciais e fornecer um principal confiável às operações protegidas.

## Referências

RF-AUTH-002/004; BR-AUTH-003/004, BR-SEC-001..004; ADR-0003.

## Escopo

- Mutations/query `signIn` e `me`, JWT strategy, guard e decorator de usuário atual.
- Erros genéricos, expiração, rate limit e configuração validada.
- Testes sem token, token alterado/expirado e usuário A/B.

## Fora do escopo

Refresh token, OAuth e revogação distribuída.

## Critérios de aceite

- **AC-001:** credenciais válidas retornam JWT expirável; inválidas retornam `UNAUTHENTICATED` genérico.
- **AC-002:** `me` usa somente o subject verificado e rejeita tokens inválidos.
- **AC-003:** inputs protegidos não aceitam `userId`.

## Verificação

`pnpm --filter backend test && pnpm --filter backend test:e2e`

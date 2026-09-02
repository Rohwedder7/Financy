---
id: SPEC-005
status: completed
product: PRD-FINANCY-001
business-need: BND-FINANCY-001
owner: Frontend
depends-on: [SPEC-004]
---

# SPEC-005 — Autenticação no frontend

## Objetivo

Implementar cadastro, login, logout e restauração de sessão com Apollo.

## Referências

RF-AUTH-001..004, RF-NAV-001; RNF-A11Y-001; ADR-0003.

## Escopo

- Cliente Apollo e auth link; token em `sessionStorage`.
- Formulários RHF/Zod, feedbacks acessíveis e redirecionamento da raiz.
- Limpeza de sessão em logout ou `UNAUTHENTICATED`.

## Fora do escopo

Lembrar usuário, OAuth, recuperação de senha.

## Critérios de aceite

- **AC-001:** visitante vê login e alcança cadastro; autenticação válida abre dashboard.
- **AC-002:** recarregar a aba preserva sessão; fechar/abrir nova sessão não.
- **AC-003:** token não aparece em URL, UI, console ou mensagens de erro.
- **AC-004:** fluxos funcionam por teclado e apresentam foco de erro.

## Verificação

`pnpm --filter frontend test && pnpm --filter frontend test:e2e`

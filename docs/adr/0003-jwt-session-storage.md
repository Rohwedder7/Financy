# ADR 0003 — JWT Bearer em sessionStorage

Status: aceito — 2026-08-31

## Decisão

Autenticação stateless com JWT de curta duração enviado como Bearer e mantido em `sessionStorage`.

## Consequências

A aba perde a sessão quando fechada e a implementação GraphQL é direta. O token continua acessível a JavaScript; CSP, ausência de HTML não confiável e higiene de dependências são controles obrigatórios. Cookies HttpOnly seriam preferíveis em uma implantação first-party controlada, mas ampliam o escopo de CSRF/CORS do desafio.

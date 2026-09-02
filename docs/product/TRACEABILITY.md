---
id: TRACE-FINANCY-001
status: approved
owner: Product + QA
---

# Matriz de rastreabilidade

| Necessidade | Requisitos | Regras principais | SPEC | Evidência |
| --- | --- | --- | --- | --- |
| Conta e sessão | RF-AUTH-001/002/003/004 | BR-AUTH-001..006 | SPEC-003/004/005 | [auth.e2e-spec.ts](../../backend/test/auth.e2e-spec.ts), [auth.spec.ts](../../frontend/e2e/auth.spec.ts) |
| Isolamento | RNF-SEC-001 | BR-SEC-001..004 | SPEC-004/006/008/012 | testes A/B em [categories.e2e-spec.ts](../../backend/test/categories.e2e-spec.ts), [transactions.e2e-spec.ts](../../backend/test/transactions.e2e-spec.ts), [dashboard.e2e-spec.ts](../../backend/test/dashboard.e2e-spec.ts) |
| Categorias | RF-CAT-001..004 | BR-CAT-001..004 | SPEC-002/006/007 | [data-model.spec.ts](../../backend/test/data-model.spec.ts), [categories.e2e-spec.ts](../../backend/test/categories.e2e-spec.ts), [categories.spec.ts](../../frontend/e2e/categories.spec.ts) |
| Transações | RF-TXN-001..004 | BR-TXN-001..005 | SPEC-002/008/009 | [data-model.spec.ts](../../backend/test/data-model.spec.ts), [transactions.e2e-spec.ts](../../backend/test/transactions.e2e-spec.ts), [transactions.spec.ts](../../frontend/e2e/transactions.spec.ts) |
| Resumo | RF-DASH-001 | BR-MONEY-001, BR-DASH-001/002 | SPEC-010 | [dashboard.e2e-spec.ts](../../backend/test/dashboard.e2e-spec.ts), [dashboard.spec.ts](../../frontend/e2e/dashboard.spec.ts) |
| Navegação | RF-NAV-001 | BR-AUTH-004 | SPEC-005/010 | [auth.spec.ts](../../frontend/e2e/auth.spec.ts), [dashboard.spec.ts](../../frontend/e2e/dashboard.spec.ts) |
| Stack obrigatória | RNF-TECH-001..004 | — | SPEC-001/002 | [health.e2e-spec.ts](../../backend/test/health.e2e-spec.ts), `pnpm verify` |
| Interface Figma | RNF-UX-001 | — | SPEC-011 | **Residual `OPEN-UI-001`:** sem `node-id` das telas internas; não há evidência visual verde |
| Acessibilidade crítica | RNF-A11Y-001 | — | SPEC-005/007/009/012 | teclado em [auth.spec.ts](../../frontend/e2e/auth.spec.ts), [categories.spec.ts](../../frontend/e2e/categories.spec.ts) e [transactions.spec.ts](../../frontend/e2e/transactions.spec.ts); auditoria visual completa permanece na SPEC-011 |
| Entrega reproduzível | RNF-OPS-001/002, RNF-QA-001 | — | SPEC-001/012 | [ci.yml](../../.github/workflows/ci.yml), `pnpm verify`, `pnpm test:e2e`, `pnpm secrets:scan` |

Não considere uma SPEC concluída sem anexar no pull request a saída dos comandos de verificação indicados nela. `RNF-UX-001` não pode ser dado como atendido enquanto `OPEN-UI-001` estiver aberto.

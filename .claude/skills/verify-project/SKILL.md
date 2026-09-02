---
name: verify-project
description: Run Financy quality gates and produce a concise release-readiness report.
---

# Verify project

1. Confirm environment files contain no real secrets in versioned content.
2. Run `pnpm docs:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
3. Run `pnpm test:e2e` when application flows exist or the SPEC requires it.
4. Inspect untracked databases, build artifacts and focused/skipped tests.
5. Return commands, exit status, failures and remaining delivery checklist items. Never hide or reinterpret a failed gate.

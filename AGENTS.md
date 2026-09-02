# AGENTS.md

This repository is specification-driven. All coding agents must use `CLAUDE.md` as the universal operating contract even when the active harness is not Claude Code.

## Minimum workflow

1. Select one SPEC.
2. Resolve only its referenced product and architecture documents.
3. Inspect existing code and tests.
4. Present a plan before implementation.
5. Implement and prove acceptance criteria with tests.
6. Run `pnpm verify` and report evidence plus residual risk.

Agents must never infer missing product policy, bypass ownership checks, expose secrets or expand the mandatory grading scope.

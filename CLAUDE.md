# CLAUDE.md

## Mission

Build Financy exactly from approved product documents and one scoped SPEC at a time. Preserve the official NestJS and Vite scaffolding patterns, the Figma visual language and the grader-facing mandatory scope.

## Read order

For a non-trivial change:

1. Read this file.
2. Read the selected SPEC under `specs/active/`.
3. Follow only the BND, PRD, business-rule and ADR references named by that SPEC.
4. Inspect relevant code and tests before planning.
5. Do not load every document by default; use `docs/product/INDEX.md`.

## Source-of-truth priority

1. Security and legal constraints.
2. Approved SPEC for feature behavior.
3. `docs/product/BUSINESS_RULES.md` for cross-feature domain rules.
4. `docs/product/PRD.md` for product capabilities and journeys.
5. `docs/product/BND.md` for business need and outcomes.
6. Architecture and ADRs for durable technical invariants.
7. Existing code only when it does not conflict with approved documents.

Never silently resolve a conflict. Stop, identify both sources and request a product decision.

## Stack invariants

- Node.js 24 LTS, pnpm workspaces and ESM.
- Backend: NestJS 12, code-first GraphQL, Prisma 7 and SQLite.
- Frontend: React 19, Vite 8, React Router, Apollo Client and Tailwind CSS 4.
- Validation: class-validator at API boundaries; React Hook Form and Zod in forms.
- Tests: Vitest for backend and frontend; Playwright for critical browser journeys.
- Currency is stored as integer cents. Never store application money as floating point.

## Security invariants

- Never accept `userId` from a client for protected ownership decisions.
- Derive the current user only from a verified JWT.
- Every category and transaction query/mutation must filter by both resource ID and authenticated user ID.
- Never return `passwordHash` through GraphQL.
- Never log credentials, tokens, hashes or complete authorization headers.
- Never commit `.env`, SQLite database files or real user data.
- CORS uses the configured frontend origin; do not use unrestricted origins outside tests.

## Figma rules

- The supplied file currently exposes the cover node and an embedded dashboard preview, not the implementation frames.
- Do not invent missing screens, tokens or assets.
- Before implementing `SPEC-011`, obtain direct node-specific links for the internal “Projeto” and “Style Guide” destinations.
- Start with the Figma Style Guide, then build shared UI components, then pages.
- Reuse exact exported assets; never redraw the Figma logo or icons manually.

## Development workflow

- Planning is mandatory before editing implementation files.
- Implement one SPEC at a time.
- Map each test to an acceptance criterion.
- Prefer the smallest change that satisfies the SPEC.
- Do not add optional features to the mandatory delivery branch.
- Update the source document when behavior or a durable decision changes.

## Canonical checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm docs:validate
```

Run `pnpm verify` before reporting implementation complete. Run E2E when a user journey, authorization boundary or route behavior changes.

## Definition of done

- All referenced acceptance criteria are demonstrably satisfied.
- Ownership and unauthorized-access cases are tested.
- Lint, typecheck, tests and build pass.
- Relevant E2E journeys pass.
- No unrelated dependency or design change is included.
- Documentation and generated GraphQL artifacts are current.
- Remaining risks are explicitly reported.

## Never alter without explicit approval

- Mandatory functional scope in the PRD.
- Ownership rules `BR-SEC-001` through `BR-SEC-004`.
- SQLite as the grading database.
- The Figma-derived visual direction.
- The rule that optional features use a separate branch.

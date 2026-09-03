# Financy

Financy is a full-stack personal finance manager for organizing transactions and categories. It is the practical graduation challenge described in `docs/product/BND.md` and `docs/product/PRD.md`.

This repository is specification-driven. Product intent lives under `docs/product/`, durable technical decisions under `docs/architecture/` and `docs/adr/`, and executable feature contracts under `specs/`.

## Current status

- SPECs 001–012 are completed on `main` (auth, categories, transactions, dashboard, Figma UI, CI).
- Comparison screenshots live in `docs/product/visual/`. `OPEN-UI-001` is an accepted limitation: no Figma PAT for Dev Mode CSS-variable export.

## Stack

- Node.js 24 LTS and pnpm workspaces.
- NestJS 12, GraphQL, Apollo and Prisma 7 with SQLite.
- React 19, Vite 8, Apollo Client, React Router and Tailwind CSS 4.
- Vitest, Testing Library and Playwright.

## Run in five minutes

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Replace JWT_SECRET in backend/.env with a unique value of at least 32 characters.
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Or `pnpm setup` after copying the env files (install, generate client and apply migrations).

Default local addresses:

- Frontend: `http://localhost:5173`
- GraphQL API: `http://localhost:3000/graphql`

A visitor sees login at `/`. After sign-up or sign-in the same route shows the dashboard. Authenticated users manage `/transacoes` and `/categorias`.

## Canonical commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run frontend and backend in watch mode |
| `pnpm lint` | Run source and documentation checks |
| `pnpm typecheck` | Type-check both applications |
| `pnpm test` | Run unit and integration tests |
| `pnpm test:e2e` | Run backend and browser journeys |
| `pnpm build` | Produce production builds |
| `pnpm verify` | Run the mandatory local quality gate |
| `pnpm db:migrate` | Create or apply a development migration |
| `pnpm secrets:scan` | Fail if tracked env, SQLite or key files appear |

## Work with Claude Code

1. Read `CLAUDE.md`.
2. Select exactly one active or planned SPEC.
3. Move a planned SPEC to `specs/active/` only after explicit approval.
4. Create a plan mapped to its acceptance criteria.
5. Implement in small increments and run `pnpm verify`.
6. Ask the reviewer agent to verify behavior against the SPEC.

Setup for Context7, Figma and Superpowers is documented in `docs/tooling/MCP_SETUP.md`.

## Delivery rule

The public grading branch must contain only mandatory challenge behavior. Optional avatar upload or other experiments belong in a separate branch after the required submission is preserved. Visual comparison screenshots live in `docs/product/visual/`. `OPEN-UI-001` records the accepted gap of Dev Mode variable export without a Figma PAT.

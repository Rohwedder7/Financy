.PHONY: setup dev lint typecheck test test-e2e build verify db-migrate

setup:
	pnpm setup

dev:
	pnpm dev

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

test-e2e:
	pnpm test:e2e

build:
	pnpm build

verify:
	pnpm verify

db-migrate:
	pnpm db:migrate

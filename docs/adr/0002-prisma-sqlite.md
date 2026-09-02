# ADR 0002 — Prisma com SQLite

Status: aceito — 2026-08-31

## Decisão

Persistir com Prisma 7 e SQLite, usando adapter `better-sqlite3` e migrations versionadas.

## Razões e consequências

Atende o requisito obrigatório e simplifica correção local. Concorrência e recursos específicos de PostgreSQL não são metas. A configuração isola `DATABASE_URL`, permitindo migração futura mediante nova ADR.

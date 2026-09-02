# ADR 0001 — Monólito modular em monorepo

Status: aceito — 2026-08-31

## Contexto

O produto possui um frontend, uma API e três domínios pequenos, com prazo curto e execução local obrigatória.

## Decisão

Usar workspace pnpm com `frontend/` e `backend/`; a API será monólito modular por feature.

## Consequências

Baixo custo de execução e mudanças atômicas. Fronteiras permanecem explícitas, mas não há independência de deploy entre módulos — desnecessária neste escopo.

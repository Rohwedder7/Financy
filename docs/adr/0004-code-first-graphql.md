# ADR 0004 — GraphQL code-first

Status: aceito — 2026-08-31

## Decisão

Definir o schema com decorators TypeScript do NestJS e gerar o SDL automaticamente.

## Consequências

Tipos da API permanecem próximos da implementação e da validação. O schema gerado é artefato de inspeção, não deve ser editado manualmente. Mudanças de contrato continuam exigindo revisão explícita.

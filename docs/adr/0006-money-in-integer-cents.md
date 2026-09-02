# ADR 0006 — Dinheiro em centavos inteiros

Status: aceito — 2026-08-31

## Decisão

Transportar, persistir e calcular valores como inteiros positivos em centavos; `type` determina receita ou despesa.

## Consequências

Evita erro binário de ponto flutuante e mantém o contrato GraphQL simples. Formatação e conversão de input decimal ficam nas bordas e recebem testes específicos.

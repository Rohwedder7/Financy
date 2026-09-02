# ADR 0007 — Restrições SQL que o Prisma não modela

Status: aceito — 2026-08-31

## Contexto

O Prisma 7 não declara `CHECK` no schema. A afinidade de tipo do SQLite é fraca: uma coluna `INTEGER NOT NULL` aceita `10.05` e o armazena como REAL. Sem restrição no banco, `BR-TXN-001` e `BR-MONEY-001` dependeriam exclusivamente da borda da API.

## Decisão

Restrições exigidas por regra de negócio que o Prisma não consegue declarar são escritas à mão no arquivo de migration. Hoje são duas: o `CHECK` de positividade e integralidade em `Transaction.amountInCents` (`BR-TXN-001`) e o `CHECK` de normalização em `User.email` (`BR-AUTH-001`), sem o qual o índice único — sensível a caixa no SQLite — não garantiria unicidade global.

Toda restrição manual carrega três obrigações:

1. Um comentário na migration explicando a regra que a sustenta.
2. Um teste de integração que a exercite por SQL cru, não pelo Prisma Client — o cliente coage o valor antes do SQL e mascararia a ausência da restrição.
3. Reaplicação explícita sempre que uma migration futura redefinir a tabela.

## Consequências

A terceira obrigação é a arriscada. O SQLite não altera colunas no lugar; o Prisma reconstrói a tabela (`RedefineTables`), copia os dados e descarta o que não está no schema. A restrição desaparece e `prisma migrate dev` responde `Already in sync`, porque a mesma cegueira que evita falso drift impede o Prisma de notar a perda.

O guarda real é o teste, não a ferramenta. `backend/test/data-model.spec.ts` roda contra um banco construído pelas migrations reais e tenta violar cada restrição por SQL cru, então falha se alguma sumir. Esses testes não podem ser enfraquecidos sem substituir a proteção.

Um `ALTER TABLE … ADD COLUMN` é seguro, porque o Prisma não reconstrói a tabela nesse caso. Alterar ou remover coluna, ou acrescentar chave estrangeira, não é.

Uma alternativa considerada foi abandonar o `CHECK` e confiar apenas em `class-validator`. Foi recusada porque deixaria a integridade monetária dependente de uma única camada, e porque o `AC-003` da SPEC-002 exige a garantia no modelo.

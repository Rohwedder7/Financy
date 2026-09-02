# Contrato GraphQL planejado

O schema é **code-first** no NestJS e será gerado para inspeção. Nomes abaixo constituem contrato; mudanças incompatíveis exigem ADR ou versão coordenada.

## Queries

```graphql
type Query {
  health: String!
  me: User!
  categories: [Category!]!
  transactions: [Transaction!]!
  dashboard: Dashboard!
}
```

## Mutations

```graphql
type Mutation {
  signUp(input: SignUpInput!): AuthPayload!
  signIn(input: SignInInput!): AuthPayload!
  createCategory(input: CreateCategoryInput!): Category!
  updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
  deleteCategory(id: ID!): Boolean!
  createTransaction(input: CreateTransactionInput!): Transaction!
  updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
  deleteTransaction(id: ID!): Boolean!
}
```

`userId`, `passwordHash` e campos internos nunca são inputs ou outputs públicos. Valores monetários usam `Int` em centavos. Datas usam escalar ISO DateTime.

## Dashboard

```graphql
type Dashboard {
  balanceInCents: Int!
  expenseInCents: Int!
  incomeInCents: Int!
}
```

`dashboard` exige o mesmo Bearer das demais queries protegidas. Os totais consideram só transações do principal. `balanceInCents` é `incomeInCents - expenseInCents` em inteiros; sem transações os três campos são `0`, nunca nulos. Saldo negativo é um `Int` válido.

## Categorias

```graphql
type Category {
  id: ID!
  name: String!
  color: String
  createdAt: DateTime!
}

input CreateCategoryInput {
  name: String!
  color: String
}

input UpdateCategoryInput {
  name: String
  color: String
}
```

`color`, quando presente, é exatamente `#` seguido de seis dígitos hexadecimais (`#RRGGBB`). A comparação é insensível a caixa; a API persiste a forma em maiúsculas. Omitir o campo em `updateCategory` mantém a cor; enviar `null` remove. `icon` e `userId` não fazem parte do contrato público.

## Transações

```graphql
enum TransactionType {
  INCOME
  EXPENSE
}

type Transaction {
  id: ID!
  description: String!
  amountInCents: Int!
  type: TransactionType!
  occurredAt: DateTime!
  categoryId: ID!
  category: Category!
  createdAt: DateTime!
}

input CreateTransactionInput {
  description: String!
  amountInCents: Int!
  type: TransactionType!
  occurredAt: DateTime!
  categoryId: ID!
}

input UpdateTransactionInput {
  description: String
  amountInCents: Int
  type: TransactionType
  occurredAt: DateTime
  categoryId: ID
}
```

`amountInCents` é inteiro positivo; a borda recusa decimal, zero e negativo (`@IsInt()` + `@Min(1)`), porque o Prisma Client truncaria `10.05` para `10` antes do SQL. O tipo GraphQL é `Int`, nunca `Float`. `userId` não faz parte do contrato público.

## Autenticação

Operações protegidas exigem `Authorization: Bearer <token>`. `health`, `signUp` e `signIn` são públicas. O contexto GraphQL expõe um principal verificado, não o token bruto.

## Erros

Usar `extensions.code` estável: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `NOT_FOUND`, `CONFLICT`, `CATEGORY_IN_USE`, `TOO_MANY_REQUESTS` e `INTERNAL_SERVER_ERROR`. Mensagens internas, SQL e stack trace não chegam ao cliente em produção.

`TOO_MANY_REQUESTS` foi acrescentado para atender `BR-AUTH-006`: sem ele, o excesso de tentativas retornava `INTERNAL_SERVER_ERROR`, que é semanticamente errado e expunha o nome de uma classe interna.

A garantia sobre mensagens é imposta por um `formatError` com lista de permissão invertida: apenas erros que a própria aplicação escreve, marcados com `safe`, preservam o texto; qualquer outro recebe mensagem genérica derivada do código, em todos os ambientes. A inversão é necessária porque o graphql-js devolve o valor rejeitado dentro da mensagem de coerção de variável — uma senha enviada como array seria refletida em texto puro.

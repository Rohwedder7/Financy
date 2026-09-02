import { gql } from '@apollo/client'
import type { ApolloCache } from '@apollo/client'
import { writeDashboard } from '../dashboard/operations.ts'
import { summarizeDashboard } from '../dashboard/summarize.ts'
import type { Category } from '../categories/operations.ts'

export const TRANSACTIONS_QUERY = gql`
  query Transactions {
    transactions {
      id
      description
      amountInCents
      type
      occurredAt
      createdAt
      categoryId
      category {
        id
        name
        color
      }
    }
  }
`

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amountInCents
      type
      occurredAt
      createdAt
      categoryId
      category {
        id
        name
        color
      }
    }
  }
`

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amountInCents
      type
      occurredAt
      createdAt
      categoryId
      category {
        id
        name
        color
      }
    }
  }
`

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  description: string
  amountInCents: number
  type: TransactionType
  occurredAt: string
  createdAt: string
  categoryId: string
  category: Pick<Category, 'id' | 'name' | 'color'>
}

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((left, right) => {
    const byDate = right.occurredAt.localeCompare(left.occurredAt)
    return byDate !== 0 ? byDate : right.createdAt.localeCompare(left.createdAt)
  })
}

export function writeTransactions(cache: ApolloCache, transactions: Transaction[]): void {
  cache.writeQuery({ data: { transactions }, query: TRANSACTIONS_QUERY })
  writeDashboard(cache, summarizeDashboard(transactions))
}

export function readTransactions(cache: ApolloCache): Transaction[] {
  return cache.readQuery<{ transactions: Transaction[] }>({ query: TRANSACTIONS_QUERY })?.transactions ?? []
}

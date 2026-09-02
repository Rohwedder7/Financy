import { gql } from '@apollo/client'
import type { ApolloCache } from '@apollo/client'

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      color
      createdAt
    }
  }
`

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      color
      createdAt
    }
  }
`

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      color
      createdAt
    }
  }
`

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export interface Category {
  id: string
  name: string
  color: string | null
  createdAt: string
}

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((left, right) => {
    const byName = left.name.localeCompare(right.name, 'pt', { sensitivity: 'base' })
    return byName !== 0 ? byName : left.createdAt.localeCompare(right.createdAt)
  })
}

export function writeCategories(cache: ApolloCache, categories: Category[]): void {
  cache.writeQuery({ data: { categories }, query: CATEGORIES_QUERY })
}

export function readCategories(cache: ApolloCache): Category[] {
  return cache.readQuery<{ categories: Category[] }>({ query: CATEGORIES_QUERY })?.categories ?? []
}

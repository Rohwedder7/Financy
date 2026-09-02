import { describe, expect, it } from 'vitest'
import { categoryMutationMessage } from './messages.ts'
import { CombinedGraphQLErrors } from '@apollo/client/errors'

function graphQLError(code: string) {
  return new CombinedGraphQLErrors({
    errors: [{ extensions: { code }, message: 'internal' }],
  })
}

describe('categoryMutationMessage', () => {
  it('explains that a used category can be renamed instead of deleted', () => {
    expect(categoryMutationMessage(graphQLError('CATEGORY_IN_USE'))).toBe(
      'Esta categoria ainda tem transações. Renomeie-a ou associe as transações a outra categoria antes de excluir.',
    )
  })

  it('maps a duplicated name without echoing stored values', () => {
    expect(categoryMutationMessage(graphQLError('CONFLICT'))).toBe(
      'Já existe uma categoria com este nome.',
    )
  })
})

import { graphqlErrorCode } from '../../lib/graphql-error.ts'

export function categoryMutationMessage(error: unknown): string {
  const code = graphqlErrorCode(error)

  if (code === 'CONFLICT') {
    return 'Já existe uma categoria com este nome.'
  }

  if (code === 'CATEGORY_IN_USE') {
    return 'Esta categoria ainda tem transações. Renomeie-a ou associe as transações a outra categoria antes de excluir.'
  }

  if (code === 'BAD_USER_INPUT') {
    return 'Os dados informados são inválidos.'
  }

  if (code === 'NOT_FOUND') {
    return 'Categoria não encontrada.'
  }

  return 'Não foi possível concluir a operação. Tente de novo.'
}

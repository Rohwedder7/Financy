import { graphqlErrorCode } from '../../lib/graphql-error.ts'

export function transactionMutationMessage(error: unknown): string {
  const code = graphqlErrorCode(error)

  if (code === 'BAD_USER_INPUT') {
    return 'Os dados informados são inválidos.'
  }

  if (code === 'NOT_FOUND') {
    return 'Transação não encontrada.'
  }

  return 'Não foi possível concluir a operação. Tente de novo.'
}

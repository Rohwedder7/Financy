import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthPayload {
  token: string
  user: AuthUser
}

import { GraphQLError } from 'graphql';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { UserModel } from './models/user.model.js';

function unauthenticated(): GraphQLError {
  return new GraphQLError('Authentication is required.', {
    extensions: { code: 'UNAUTHENTICATED', safe: true },
  });
}

/**
 * BR-SEC-001: the single supported way for a resolver to learn who is calling.
 * Missing `req.user` means the guard was skipped — fail closed rather than
 * treating an anonymous caller as an authenticated owner.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserModel => {
    const user = GqlExecutionContext.create(context).getContext<{
      req: { user?: UserModel };
    }>().req.user;

    if (!user) {
      throw unauthenticated();
    }

    return user;
  },
);

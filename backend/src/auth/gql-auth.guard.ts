import { Injectable, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { GraphQLError } from 'graphql';
import type { UserModel } from './models/user.model.js';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext<{ req: unknown }>().req;
  }

  /**
   * Collapses every rejection — absent, malformed, tampered or expired token —
   * into one response, so none of them can be told apart.
   */
  handleRequest<TUser = UserModel>(error: unknown, user: TUser | false): TUser {
    if (error || !user) {
      throw new GraphQLError('Authentication is required.', {
        extensions: { code: 'UNAUTHENTICATED', safe: true },
      });
    }

    return user;
  }
}

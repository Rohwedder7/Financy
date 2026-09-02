import { Injectable, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GraphQLError } from 'graphql';

/**
 * The stock guard reads the HTTP context directly, which GraphQL does not expose.
 * This unwraps the GraphQL context so rate limiting applies to mutations.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext<{
      req: Record<string, unknown>;
      res: Record<string, unknown>;
    }>();

    return { req: gqlContext.req, res: gqlContext.res };
  }

  /**
   * The default raises an HTTP exception, which GraphQL surfaces as
   * INTERNAL_SERVER_ERROR and whose text leaks the internal class name.
   */
  protected throwThrottlingException(): Promise<void> {
    throw new GraphQLError('Too many attempts. Please try again later.', {
      extensions: { code: 'TOO_MANY_REQUESTS', safe: true },
    });
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthPayloadModel } from './models/auth-payload.model.js';
import { CurrentUser } from './current-user.decorator.js';
import { GqlAuthGuard } from './gql-auth.guard.js';
import { GqlThrottlerGuard } from './gql-throttler.guard.js';
import { SignInInput } from './dto/sign-in.input.js';
import { SignUpInput } from './dto/sign-up.input.js';
import { UserModel } from './models/user.model.js';

// BR-AUTH-006: bounded attempts per origin on both credential endpoints.
const CREDENTIAL_RATE_LIMIT = { default: { limit: 10, ttl: 60_000 } };

@Resolver(() => AuthPayloadModel)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Throttle(CREDENTIAL_RATE_LIMIT)
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => AuthPayloadModel, { description: 'Creates an account and opens a session.' })
  signUp(@Args('input') input: SignUpInput): Promise<AuthPayloadModel> {
    return this.auth.signUp(input);
  }

  @Throttle(CREDENTIAL_RATE_LIMIT)
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => AuthPayloadModel, { description: 'Opens a session for existing credentials.' })
  signIn(@Args('input') input: SignInInput): Promise<AuthPayloadModel> {
    return this.auth.signIn(input);
  }

  /**
   * The resolver takes no arguments on purpose: the only identity it can serve
   * is the one the guard verified.
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => UserModel, { description: 'The authenticated user.' })
  me(@CurrentUser() user: UserModel): UserModel {
    return user;
  }
}

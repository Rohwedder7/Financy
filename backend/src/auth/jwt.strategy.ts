import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GraphQLError } from 'graphql';
import { DatabaseService } from '../database/database.service.js';
import { PUBLIC_USER_FIELDS } from './public-user.js';
import type { UserModel } from './models/user.model.js';

interface JwtPayload {
  exp?: unknown;
  iat?: unknown;
  sub?: unknown;
}

/** Signup issues 15m tokens; anything longer is not one of ours. */
const MAXIMUM_LIFETIME_SECONDS = 20 * 60;

function unauthenticated(): GraphQLError {
  return new GraphQLError('Authentication is required.', {
    extensions: { code: 'UNAUTHENTICATED', safe: true },
  });
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly database: DatabaseService,
  ) {
    super({
      algorithms: ['HS256'],
      audience: config.getOrThrow<string>('JWT_AUDIENCE'),
      ignoreExpiration: false,
      issuer: config.getOrThrow<string>('JWT_ISSUER'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * BR-SEC-001: only `sub` from the verified signature identifies the caller.
   * BR-AUTH-004: a token without a short `exp` is not a session.
   */
  async validate(payload: JwtPayload): Promise<UserModel> {
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
      throw unauthenticated();
    }

    if (payload.exp - payload.iat > MAXIMUM_LIFETIME_SECONDS) {
      throw unauthenticated();
    }

    const user = await this.database.user.findUnique({
      select: PUBLIC_USER_FIELDS,
      where: { id: payload.sub },
    });

    if (!user) {
      throw unauthenticated();
    }

    return user;
  }
}

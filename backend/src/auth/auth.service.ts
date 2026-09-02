import { Injectable, type OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GraphQLError } from 'graphql';
import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { DatabaseService } from '../database/database.service.js';
import { normalizeEmail, normalizeName } from './normalization.js';
import { PUBLIC_USER_FIELDS, toPublicUser } from './public-user.js';
import type { AuthPayloadModel } from './models/auth-payload.model.js';
import type { SignInInput } from './dto/sign-in.input.js';
import type { SignUpInput } from './dto/sign-up.input.js';
import type { UserModel } from './models/user.model.js';

const UNIQUE_CONSTRAINT = 'P2002';

function isDuplicateEmail(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'code' in error && error.code === UNIQUE_CONSTRAINT
  );
}

/** BR-AUTH-003: one message for every failure mode, so none of them is distinguishable. */
function invalidCredentials(): GraphQLError {
  return new GraphQLError('Invalid e-mail or password.', {
    extensions: { code: 'UNAUTHENTICATED', safe: true },
  });
}

@Injectable()
export class AuthService implements OnModuleInit {
  private decoyHash?: Promise<string>;

  constructor(
    private readonly database: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.decoy();
  }

  async signUp(input: SignUpInput): Promise<AuthPayloadModel> {
    // BR-AUTH-002 / RNF-SEC-002: the plaintext password never leaves this scope.
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

    let user: UserModel;

    try {
      user = await this.database.user.create({
        data: {
          email: normalizeEmail(input.email),
          name: normalizeName(input.name),
          passwordHash,
        },
        select: PUBLIC_USER_FIELDS,
      });
    } catch (error) {
      if (isDuplicateEmail(error)) {
        // Deliberately opaque: it states the conflict without echoing any stored material.
        throw new GraphQLError('An account with this e-mail already exists.', {
          extensions: { code: 'CONFLICT', safe: true },
        });
      }

      throw error;
    }

    return { token: await this.issueToken(user.id), user };
  }

  async signIn(input: SignInInput): Promise<AuthPayloadModel> {
    const record = await this.database.user.findUnique({
      select: { ...PUBLIC_USER_FIELDS, passwordHash: true },
      where: { email: normalizeEmail(input.email) },
    });

    // Always spend a verification, even with no account, so response time does
    // not disclose which e-mails are registered.
    const matches = await argon2.verify(
      record?.passwordHash ?? (await this.decoy()),
      input.password,
    );

    if (!record || !matches) {
      throw invalidCredentials();
    }

    return { token: await this.issueToken(record.id), user: toPublicUser(record) };
  }

  /**
   * A throwaway hash carrying the same cost parameters as a real one, so a
   * missing account costs what a wrong password costs. Warmed at boot so the
   * first unknown e-mail does not pay hash+verify.
   */
  private decoy(): Promise<string> {
    this.decoyHash ??= argon2.hash(randomUUID(), { type: argon2.argon2id });

    return this.decoyHash;
  }

  /** BR-AUTH-004: the token carries only the subject; expiry and signature come from config. */
  private issueToken(userId: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId });
  }
}

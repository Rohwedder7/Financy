import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeEmail } from '../normalization.js';

/**
 * BR-SEC-001: no `userId` here or anywhere else a client can reach.
 *
 * Password length is not the signup policy. `MinLength(8)` here would return
 * BAD_USER_INPUT instead of UNAUTHENTICATED, which distinguishes "too short to
 * be this account's password" from "wrong credentials" and breaks BR-AUTH-003.
 * MaxLength(128) is only an Argon2 DoS ceiling.
 */
@InputType()
export class SignInInput {
  @Field()
  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? normalizeEmail(value) : value))
  email!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

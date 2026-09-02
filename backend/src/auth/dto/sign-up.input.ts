import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeEmail, normalizeName } from '../normalization.js';

/** BR-SEC-004: public auth inputs never carry `userId` or any internal field. */
@InputType()
export class SignUpInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? normalizeName(value) : value))
  name!: string;

  // Normalization runs before validation, so surrounding spaces and casing do
  // not turn an existing account into an apparently new one.
  @Field()
  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? normalizeEmail(value) : value))
  email!: string;

  // BR-AUTH-005: length is the requirement; no mandatory character composition.
  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

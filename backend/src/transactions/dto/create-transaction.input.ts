import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { displayTransactionDescription } from '../transaction-description.js';
import { TransactionType } from '../transaction-type.js';

/** GraphQL Int is a signed 32-bit integer; keep the DTO aligned with the wire type. */
const GRAPHQL_INT_MAX = 2_147_483_647;

/** BR-SEC-004: transaction writes never accept `userId`; ownership comes from the JWT. */
@InputType()
export class CreateTransactionInput {
  @Field()
  @Transform(({ value }) => (typeof value === 'string' ? displayTransactionDescription(value) : value))
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description!: string;

  // ADR-0006 / SPEC-008 AC-001: Prisma would truncate 10.05 to 10 before SQL.
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(GRAPHQL_INT_MAX)
  amountInCents!: number;

  @Field(() => TransactionType)
  @IsEnum(TransactionType)
  type!: TransactionType;

  @Field()
  @Type(() => Date)
  @IsDate()
  occurredAt!: Date;

  @Field(() => ID)
  @IsString()
  @MinLength(1)
  categoryId!: string;
}

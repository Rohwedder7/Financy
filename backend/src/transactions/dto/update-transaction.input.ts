import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { displayTransactionDescription } from '../transaction-description.js';
import { TransactionType } from '../transaction-type.js';

const GRAPHQL_INT_MAX = 2_147_483_647;

@InputType()
export class UpdateTransactionInput {
  @Field({ nullable: true })
  @Transform(({ value }) => (typeof value === 'string' ? displayTransactionDescription(value) : value))
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description?: string;

  @Field(() => Int, { nullable: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(GRAPHQL_INT_MAX)
  amountInCents?: number;

  @Field(() => TransactionType, { nullable: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(TransactionType)
  type?: TransactionType;

  @Field({ nullable: true })
  @Type(() => Date)
  @ValidateIf((_, value) => value !== undefined)
  @IsDate()
  occurredAt?: Date;

  @Field(() => ID, { nullable: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  categoryId?: string;
}

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CategoryModel } from '../../categories/models/category.model.js';
import { TransactionType } from '../transaction-type.js';

@ObjectType('Transaction')
export class TransactionModel {
  @Field(() => ID)
  id!: string;

  @Field()
  description!: string;

  @Field(() => Int)
  amountInCents!: number;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field()
  occurredAt!: Date;

  @Field(() => ID)
  categoryId!: string;

  @Field(() => CategoryModel)
  category!: CategoryModel;

  @Field()
  createdAt!: Date;
}

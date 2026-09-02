import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import type { UserModel } from '../auth/models/user.model.js';
import { CreateTransactionInput } from './dto/create-transaction.input.js';
import { UpdateTransactionInput } from './dto/update-transaction.input.js';
import { TransactionModel } from './models/transaction.model.js';
import { TransactionService } from './transaction.service.js';

@UseGuards(GqlAuthGuard)
@Resolver(() => TransactionModel)
export class TransactionResolver {
  constructor(private readonly transactions: TransactionService) {}

  @Query(() => [TransactionModel], {
    description: 'Transactions owned by the authenticated user.',
    name: 'transactions',
  })
  listTransactions(@CurrentUser() user: UserModel): Promise<TransactionModel[]> {
    return this.transactions.list(user.id);
  }

  @Mutation(() => TransactionModel, {
    description: 'Creates an income or expense for the authenticated user.',
  })
  createTransaction(
    @CurrentUser() user: UserModel,
    @Args('input') input: CreateTransactionInput,
  ): Promise<TransactionModel> {
    return this.transactions.create(user.id, input);
  }

  @Mutation(() => TransactionModel, {
    description: 'Updates a transaction owned by the authenticated user.',
  })
  updateTransaction(
    @CurrentUser() user: UserModel,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTransactionInput,
  ): Promise<TransactionModel> {
    return this.transactions.update(user.id, id, input);
  }

  @Mutation(() => Boolean, { description: 'Deletes a transaction owned by the authenticated user.' })
  deleteTransaction(
    @CurrentUser() user: UserModel,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.transactions.remove(user.id, id);
  }
}

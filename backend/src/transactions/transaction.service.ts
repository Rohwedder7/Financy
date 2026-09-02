import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { DatabaseService } from '../database/database.service.js';
import type { CreateTransactionInput } from './dto/create-transaction.input.js';
import type { UpdateTransactionInput } from './dto/update-transaction.input.js';
import type { TransactionModel } from './models/transaction.model.js';
import { PUBLIC_TRANSACTION_FIELDS } from './public-transaction.js';

const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_FAILED = 'P2003';

function isPrismaCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function notFound(): GraphQLError {
  return new GraphQLError('Transaction not found.', {
    extensions: { code: 'NOT_FOUND', safe: true },
  });
}

@Injectable()
export class TransactionService {
  constructor(private readonly database: DatabaseService) {}

  list(userId: string): Promise<TransactionModel[]> {
    return this.database.transaction.findMany({
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      select: PUBLIC_TRANSACTION_FIELDS,
      where: { userId },
    });
  }

  async create(userId: string, input: CreateTransactionInput): Promise<TransactionModel> {
    await this.requireOwnedCategory(userId, input.categoryId);

    try {
      return await this.database.transaction.create({
        data: {
          amountInCents: input.amountInCents,
          category: { connect: { id_userId: { id: input.categoryId, userId } } },
          description: input.description,
          occurredAt: input.occurredAt,
          type: input.type,
          user: { connect: { id: userId } },
        },
        select: PUBLIC_TRANSACTION_FIELDS,
      });
    } catch (error) {
      if (isPrismaCode(error, FOREIGN_KEY_FAILED) || isPrismaCode(error, RECORD_NOT_FOUND)) {
        throw notFound();
      }

      throw error;
    }
  }

  async update(userId: string, id: string, input: UpdateTransactionInput): Promise<TransactionModel> {
    const owned = await this.database.transaction.findFirst({
      select: { id: true },
      where: { id, userId },
    });

    if (!owned) {
      throw notFound();
    }

    if (input.categoryId !== undefined) {
      await this.requireOwnedCategory(userId, input.categoryId);
    }

    try {
      return await this.database.transaction.update({
        data: {
          ...(input.amountInCents !== undefined ? { amountInCents: input.amountInCents } : {}),
          ...(input.categoryId !== undefined
            ? { category: { connect: { id_userId: { id: input.categoryId, userId } } } }
            : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.occurredAt !== undefined ? { occurredAt: input.occurredAt } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
        },
        select: PUBLIC_TRANSACTION_FIELDS,
        where: { id },
      });
    } catch (error) {
      if (isPrismaCode(error, FOREIGN_KEY_FAILED) || isPrismaCode(error, RECORD_NOT_FOUND)) {
        throw notFound();
      }

      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const result = await this.database.transaction.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw notFound();
    }

    return true;
  }

  private async requireOwnedCategory(userId: string, categoryId: string): Promise<void> {
    const category = await this.database.category.findUnique({
      select: { id: true },
      where: { id_userId: { id: categoryId, userId } },
    });

    if (!category) {
      throw notFound();
    }
  }
}

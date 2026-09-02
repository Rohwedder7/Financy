import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateTransactionInput } from './dto/create-transaction.input.js';
import { TransactionType } from './transaction-type.js';

function input(overrides: Record<string, unknown> = {}) {
  return plainToInstance(CreateTransactionInput, {
    amountInCents: 1_005,
    categoryId: 'cat-owned',
    description: 'Jantar',
    occurredAt: new Date('2026-01-15T12:00:00.000Z'),
    type: TransactionType.EXPENSE,
    ...overrides,
  });
}

describe('CreateTransactionInput', () => {
  it('AC-001: rejects a decimal, zero and a negative amount before Prisma can truncate', async () => {
    for (const amountInCents of [10.05, 0, -1_005]) {
      const errors = await validate(input({ amountInCents }));
      expect(errors.some((error) => error.property === 'amountInCents')).toBe(true);
    }
  });

  it('accepts a positive integer in cents', async () => {
    expect(await validate(input({ amountInCents: 1_005 }))).toHaveLength(0);
  });

  it('rejects a blank description after trim', async () => {
    const errors = await validate(input({ description: '   ' }));
    expect(errors.some((error) => error.property === 'description')).toBe(true);
  });
});

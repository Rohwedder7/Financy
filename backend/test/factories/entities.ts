import { normalizeCategoryName } from '../../src/categories/category-name.js';
import { TransactionType } from '../../src/generated/prisma/enums.js';
import type { PrismaClient } from '../../src/generated/prisma/client.js';

let sequence = 0;

function next(): number {
  sequence += 1;
  return sequence;
}

/** Mirrors the storage form compared by the `Category` uniqueness constraint. */
export const normalizeName = normalizeCategoryName;

export function createUser(
  prisma: PrismaClient,
  overrides: { email?: string; name?: string; passwordHash?: string } = {},
) {
  const index = next();

  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${index}@financy.test`,
      name: overrides.name ?? `User ${index}`,
      passwordHash: overrides.passwordHash ?? `argon2id-placeholder-${index}`,
    },
  });
}

export function createCategory(
  prisma: PrismaClient,
  userId: string,
  overrides: { color?: string | null; icon?: string | null; name?: string } = {},
) {
  const name = overrides.name ?? `Category ${next()}`;

  return prisma.category.create({
    data: {
      color: overrides.color ?? null,
      icon: overrides.icon ?? null,
      name,
      normalizedName: normalizeName(name),
      user: { connect: { id: userId } },
    },
  });
}

export function createTransaction(
  prisma: PrismaClient,
  owner: { categoryId: string; userId: string },
  overrides: {
    amountInCents?: number;
    description?: string;
    occurredAt?: Date;
    type?: TransactionType;
  } = {},
) {
  const index = next();

  return prisma.transaction.create({
    data: {
      amountInCents: overrides.amountInCents ?? 1_000,
      category: { connect: { id: owner.categoryId } },
      description: overrides.description ?? `Transaction ${index}`,
      occurredAt: overrides.occurredAt ?? new Date('2026-01-15T12:00:00.000Z'),
      type: overrides.type ?? TransactionType.EXPENSE,
      user: { connect: { id: owner.userId } },
    },
  });
}

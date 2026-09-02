import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TransactionType } from '../src/generated/prisma/enums.js';
import { createTestDatabase, truncateAll, type TestDatabase } from './factories/database.js';
import { createCategory, createTransaction, createUser, normalizeName } from './factories/entities.js';

describe('financial data model', () => {
  let database: TestDatabase;

  beforeAll(async () => {
    database = await createTestDatabase();
  });

  afterAll(async () => {
    await database.destroy();
  });

  beforeEach(async () => {
    await truncateAll(database.prisma);
  });

  describe('AC-001: an empty database migrates and accepts the generated client', () => {
    it('exposes every migrated table', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);
      const transaction = await createTransaction(database.prisma, {
        categoryId: category.id,
        userId: user.id,
      });

      expect(user.id).toEqual(expect.any(String));
      expect(category.userId).toBe(user.id);
      expect(transaction.categoryId).toBe(category.id);
    });

    it('keeps colour and icon optional', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);

      expect(category.color).toBeNull();
      expect(category.icon).toBeNull();
    });
  });

  describe('AC-002: duplicated e-mail and category are rejected by the database', () => {
    it('rejects a duplicated e-mail', async () => {
      await createUser(database.prisma, { email: 'duplicated@financy.test' });

      await expect(
        createUser(database.prisma, { email: 'duplicated@financy.test' }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    // BR-AUTH-001: the unique index is case-sensitive, so global uniqueness holds
    // only because a non-normalized form cannot be stored at all. Guards ADR-0007.
    it('refuses a non-normalized e-mail even bypassing the client', async () => {
      await createUser(database.prisma, { email: 'pessoa@financy.test' });

      await expect(
        database.prisma.$executeRawUnsafe(
          `INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt")
           VALUES ('raw-uppercase', 'Raw', 'Pessoa@Financy.test', 'x', 0, 0)`,
        ),
      ).rejects.toThrow(/CHECK constraint failed/i);

      await expect(
        database.prisma.$executeRawUnsafe(
          `INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt")
           VALUES ('raw-spaced', 'Raw', ' outra@financy.test ', 'x', 0, 0)`,
        ),
      ).rejects.toThrow(/CHECK constraint failed/i);
    });

    it('rejects the same normalized category name for one owner', async () => {
      const user = await createUser(database.prisma);
      await createCategory(database.prisma, user.id, { name: 'Mercado' });

      await expect(
        createCategory(database.prisma, user.id, { name: ' mercado ' }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it('allows the same category name for different owners', async () => {
      const [owner, other] = await Promise.all([
        createUser(database.prisma),
        createUser(database.prisma),
      ]);

      const ownerCategory = await createCategory(database.prisma, owner.id, { name: 'Mercado' });
      const otherCategory = await createCategory(database.prisma, other.id, { name: 'Mercado' });

      expect(ownerCategory.normalizedName).toBe(normalizeName('Mercado'));
      expect(otherCategory.normalizedName).toBe(ownerCategory.normalizedName);
      expect(otherCategory.userId).not.toBe(ownerCategory.userId);
    });
  });

  describe('AC-003: money is stored as integer cents only', () => {
    it('never lets a decimal reach storage, even bypassing the client', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);

      await expect(
        database.prisma.$executeRawUnsafe(
          `INSERT INTO "Transaction"
             ("id", "description", "amountInCents", "type", "occurredAt", "categoryId", "userId", "createdAt", "updatedAt")
           VALUES ('raw-decimal', 'Raw decimal', 10.05, 'EXPENSE', 0, ?, ?, 0, 0)`,
          category.id,
          user.id,
        ),
      ).rejects.toThrow(/CHECK constraint failed/i);
    });

    it('truncates a decimal handed to the client, so the API boundary must reject it first', async () => {
      // ADR-0006 assigns decimal conversion to the boundaries. This documents the
      // client-side truncation that makes `@IsInt()` mandatory in SPEC-008.
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);

      const stored = await createTransaction(
        database.prisma,
        { categoryId: category.id, userId: user.id },
        { amountInCents: 10.05 },
      );

      expect(stored.amountInCents).toBe(10);
    });

    it('rejects a non-positive amount', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);

      for (const amountInCents of [0, -1_005]) {
        await expect(
          createTransaction(
            database.prisma,
            { categoryId: category.id, userId: user.id },
            { amountInCents },
          ),
        ).rejects.toThrow(/CHECK constraint failed/i);
      }
    });

    it('round-trips integer cents without precision loss', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);

      const stored = await createTransaction(
        database.prisma,
        { categoryId: category.id, userId: user.id },
        { amountInCents: 1_005, type: TransactionType.INCOME },
      );

      expect(stored.amountInCents).toBe(1_005);
      expect(Number.isInteger(stored.amountInCents)).toBe(true);
    });
  });

  describe('BR-TXN-003: a transaction cannot borrow another owner\u2019s category', () => {
    it('refuses the cross-owner reference at the database level', async () => {
      const [owner, intruder] = await Promise.all([
        createUser(database.prisma),
        createUser(database.prisma),
      ]);
      const ownerCategory = await createCategory(database.prisma, owner.id);

      await expect(
        createTransaction(database.prisma, {
          categoryId: ownerCategory.id,
          userId: intruder.id,
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });
  });

  describe('deletion policy', () => {
    // Control for the case below: proves the rejection comes from the reference,
    // not from category deletion being broken outright.
    it('deletes a category that no transaction references', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);

      await database.prisma.category.delete({ where: { id: category.id } });

      await expect(database.prisma.category.count()).resolves.toBe(0);
    });

    it('refuses to delete a category still referenced by a transaction', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);
      await createTransaction(database.prisma, { categoryId: category.id, userId: user.id });

      await expect(
        database.prisma.category.delete({ where: { id: category.id } }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('cascades the deletion of an owner to categories and transactions', async () => {
      const user = await createUser(database.prisma);
      const category = await createCategory(database.prisma, user.id);
      await createTransaction(database.prisma, { categoryId: category.id, userId: user.id });

      await database.prisma.user.delete({ where: { id: user.id } });

      await expect(database.prisma.category.count()).resolves.toBe(0);
      await expect(database.prisma.transaction.count()).resolves.toBe(0);
    });
  });
});

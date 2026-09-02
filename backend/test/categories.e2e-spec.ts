import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { TransactionType } from '../src/generated/prisma/enums.js';
import { provisionDatabase } from './factories/database.js';

const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) { token user { id } }
  }
`;

const CATEGORIES = `query { categories { id name color createdAt } }`;

const CREATE = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) { id name color }
  }
`;

const UPDATE = `
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) { id name color }
  }
`;

const DELETE = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const PASSWORD = 'correct horse battery';

interface Account {
  id: string;
  token: string;
}

describe('categories (e2e)', () => {
  let app: INestApplication;
  let database: DatabaseService;
  let cleanup: () => void;
  let ana: Account;
  let bruno: Account;

  beforeAll(async () => {
    const provisioned = provisionDatabase();
    cleanup = provisioned.cleanup;
    process.env.DATABASE_URL = provisioned.url;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    database = app.get(DatabaseService);
    await app.init();

    ana = await register('ana@financy.test', 'Ana');
    bruno = await register('bruno@financy.test', 'Bruno');
  });

  afterAll(async () => {
    await app.close();
    cleanup();
  });

  beforeEach(async () => {
    await database.transaction.deleteMany();
    await database.category.deleteMany();
  });

  function post(body: Record<string, unknown>, token?: string) {
    const call = request(app.getHttpServer()).post('/graphql');

    if (token) {
      call.set('Authorization', `Bearer ${token}`);
    }

    return call.send(body);
  }

  async function register(email: string, name: string): Promise<Account> {
    const response = await post({
      query: SIGN_UP,
      variables: { input: { email, name, password: PASSWORD } },
    });

    expect(response.body.errors).toBeUndefined();

    return {
      id: response.body.data.signUp.user.id as string,
      token: response.body.data.signUp.token as string,
    };
  }

  async function createOwned(token: string, input: { color?: string | null; name: string }) {
    const response = await post({ query: CREATE, variables: { input } }, token);
    expect(response.body.errors).toBeUndefined();
    return response.body.data.createCategory as { color: string | null; id: string; name: string };
  }

  describe('AC-001: the list contains only the principal categories and is ordered', () => {
    it('returns the caller categories sorted by normalized name', async () => {
      await createOwned(bruno.token, { name: 'Outro' });
      await createOwned(ana.token, { name: 'Mercado' });
      await createOwned(ana.token, { name: 'alimentação' });
      await createOwned(ana.token, { name: 'Aluguel' });

      const response = await post({ query: CATEGORIES }, ana.token);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.categories.map((row: { name: string }) => row.name)).toEqual([
        'alimentação',
        'Aluguel',
        'Mercado',
      ]);
    });

    it('requires authentication', async () => {
      const response = await post({ query: CATEGORIES });

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('AC-002: another user receives NOT_FOUND for a known id', () => {
    it('hides update and delete of a category owned by someone else', async () => {
      const category = await createOwned(ana.token, { name: 'Mercado' });

      const updated = await post(
        { query: UPDATE, variables: { id: category.id, input: { name: 'Hijack' } } },
        bruno.token,
      );
      const removed = await post({ query: DELETE, variables: { id: category.id } }, bruno.token);

      expect(updated.body.data).toBeNull();
      expect(updated.body.errors[0].extensions.code).toBe('NOT_FOUND');
      expect(removed.body.data).toBeNull();
      expect(removed.body.errors[0].extensions.code).toBe('NOT_FOUND');

      const stored = await database.category.findUniqueOrThrow({ where: { id: category.id } });
      expect(stored.name).toBe('Mercado');
      expect(stored.userId).toBe(ana.id);
    });

    it('returns NOT_FOUND for an unknown id', async () => {
      const response = await post(
        { query: UPDATE, variables: { id: 'missing-id', input: { name: 'X' } } },
        ana.token,
      );

      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    });
  });

  describe('AC-003: a duplicated name conflicts and a used category is not deleted', () => {
    it('rejects a case-insensitive duplicate for the same owner', async () => {
      await createOwned(ana.token, { name: 'Mercado' });

      const response = await post(
        { query: CREATE, variables: { input: { name: ' mercado ' } } },
        ana.token,
      );

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
    });

    it('allows the same name for a different owner', async () => {
      await createOwned(ana.token, { name: 'Mercado' });
      const copy = await createOwned(bruno.token, { name: 'Mercado' });
      expect(copy.name).toBe('Mercado');
    });

    it('rejects renaming onto an existing name', async () => {
      await createOwned(ana.token, { name: 'Mercado' });
      const other = await createOwned(ana.token, { name: 'Aluguel' });

      const response = await post(
        { query: UPDATE, variables: { id: other.id, input: { name: 'MERCADO' } } },
        ana.token,
      );

      expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
    });

    it('refuses to delete a category that still has transactions', async () => {
      const category = await createOwned(ana.token, { name: 'Mercado' });
      await database.transaction.create({
        data: {
          amountInCents: 1_000,
          categoryId: category.id,
          description: 'Compra',
          occurredAt: new Date('2026-01-15T12:00:00.000Z'),
          type: TransactionType.EXPENSE,
          userId: ana.id,
        },
      });

      const response = await post({ query: DELETE, variables: { id: category.id } }, ana.token);

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('CATEGORY_IN_USE');
      expect(await database.category.count({ where: { id: category.id } })).toBe(1);
    });

    it('deletes an unused category', async () => {
      const category = await createOwned(ana.token, { name: 'Mercado', color: '#a1b2c3' });
      expect(category.color).toBe('#A1B2C3');

      const response = await post({ query: DELETE, variables: { id: category.id } }, ana.token);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteCategory).toBe(true);
    });

    it('rejects a colour that is not #RRGGBB', async () => {
      const response = await post(
        { query: CREATE, variables: { input: { name: 'Mercado', color: '#fff' } } },
        ana.token,
      );

      expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    });
  });
});

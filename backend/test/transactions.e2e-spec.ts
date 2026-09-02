import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { provisionDatabase } from './factories/database.js';

const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) { token user { id } }
  }
`;

const CREATE_CATEGORY = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) { id name }
  }
`;

const TRANSACTIONS = `
  query {
    transactions {
      id
      description
      amountInCents
      type
      occurredAt
      category { id name }
    }
  }
`;

const CREATE = `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amountInCents
      type
      occurredAt
      category { id name }
    }
  }
`;

const UPDATE = `
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amountInCents
      category { id }
    }
  }
`;

const DELETE = `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

const PASSWORD = 'correct horse battery';
const OCCURRED_AT = '2026-01-15T12:00:00.000Z';

interface Account {
  id: string;
  token: string;
}

describe('transactions (e2e)', () => {
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

  async function createCategory(token: string, name: string) {
    const response = await post({ query: CREATE_CATEGORY, variables: { input: { name } } }, token);
    expect(response.body.errors).toBeUndefined();
    return response.body.data.createCategory as { id: string; name: string };
  }

  function createInput(
    categoryId: string,
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      amountInCents: 1_005,
      categoryId,
      description: 'Jantar',
      occurredAt: OCCURRED_AT,
      type: 'EXPENSE',
      ...overrides,
    };
  }

  describe('AC-001: decimal, negative and zero amounts never reach storage', () => {
    it('stores a positive integer in cents', async () => {
      const category = await createCategory(ana.token, 'Alimentação');
      const response = await post(
        { query: CREATE, variables: { input: createInput(category.id) } },
        ana.token,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createTransaction.amountInCents).toBe(1_005);
      expect(response.body.data.createTransaction.type).toBe('EXPENSE');

      const stored = await database.transaction.findUniqueOrThrow({
        where: { id: response.body.data.createTransaction.id },
      });
      expect(stored.amountInCents).toBe(1_005);
      expect(Number.isInteger(stored.amountInCents)).toBe(true);
    });

    it('rejects a decimal at the GraphQL Int boundary', async () => {
      const category = await createCategory(ana.token, 'Alimentação');
      const response = await post(
        { query: CREATE, variables: { input: createInput(category.id, { amountInCents: 10.05 }) } },
        ana.token,
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.data?.createTransaction).toBeUndefined();
      expect(await database.transaction.count()).toBe(0);
    });

    it.each([0, -1_005])('rejects a non-positive amount %s', async (amountInCents) => {
      const category = await createCategory(ana.token, 'Alimentação');
      const response = await post(
        { query: CREATE, variables: { input: createInput(category.id, { amountInCents }) } },
        ana.token,
      );

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
      expect(await database.transaction.count()).toBe(0);
    });
  });

  describe('AC-002: a foreign category is a generic NOT_FOUND and does not write', () => {
    it('refuses to create against another user category', async () => {
      const brunoCategory = await createCategory(bruno.token, 'Aluguel');
      const before = await database.transaction.count();

      const response = await post(
        { query: CREATE, variables: { input: createInput(brunoCategory.id) } },
        ana.token,
      );

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
      expect(await database.transaction.count()).toBe(before);
    });

    it('refuses to retarget an owned transaction onto a foreign category', async () => {
      const anaCategory = await createCategory(ana.token, 'Mercado');
      const brunoCategory = await createCategory(bruno.token, 'Aluguel');
      const created = await post(
        { query: CREATE, variables: { input: createInput(anaCategory.id) } },
        ana.token,
      );
      const id = created.body.data.createTransaction.id as string;

      const response = await post(
        { query: UPDATE, variables: { id, input: { categoryId: brunoCategory.id } } },
        ana.token,
      );

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');

      const stored = await database.transaction.findUniqueOrThrow({ where: { id } });
      expect(stored.categoryId).toBe(anaCategory.id);
      expect(stored.description).toBe('Jantar');
    });
  });

  describe('AC-003: another user receives NOT_FOUND for a known id', () => {
    it('hides update and delete of a transaction owned by someone else', async () => {
      const category = await createCategory(ana.token, 'Mercado');
      const created = await post(
        { query: CREATE, variables: { input: createInput(category.id) } },
        ana.token,
      );
      const id = created.body.data.createTransaction.id as string;

      const updated = await post(
        { query: UPDATE, variables: { id, input: { description: 'Hijack' } } },
        bruno.token,
      );
      const removed = await post({ query: DELETE, variables: { id } }, bruno.token);

      expect(updated.body.data).toBeNull();
      expect(updated.body.errors[0].extensions.code).toBe('NOT_FOUND');
      expect(removed.body.data).toBeNull();
      expect(removed.body.errors[0].extensions.code).toBe('NOT_FOUND');

      const stored = await database.transaction.findUniqueOrThrow({ where: { id } });
      expect(stored.description).toBe('Jantar');
      expect(stored.userId).toBe(ana.id);
    });

    it('lists only the principal transactions, newest occurrence first', async () => {
      const anaCategory = await createCategory(ana.token, 'Mercado');
      const brunoCategory = await createCategory(bruno.token, 'Aluguel');

      await post(
        {
          query: CREATE,
          variables: {
            input: createInput(brunoCategory.id, { description: 'Alheia', occurredAt: '2026-03-01T00:00:00.000Z' }),
          },
        },
        bruno.token,
      );
      await post(
        {
          query: CREATE,
          variables: {
            input: createInput(anaCategory.id, {
              description: 'Mais antiga',
              occurredAt: '2026-01-01T00:00:00.000Z',
            }),
          },
        },
        ana.token,
      );
      await post(
        {
          query: CREATE,
          variables: {
            input: createInput(anaCategory.id, {
              amountInCents: 4_250_00,
              description: 'Salário',
              occurredAt: '2026-02-01T00:00:00.000Z',
              type: 'INCOME',
            }),
          },
        },
        ana.token,
      );

      const response = await post({ query: TRANSACTIONS }, ana.token);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.transactions.map((row: { description: string }) => row.description)).toEqual([
        'Salário',
        'Mais antiga',
      ]);
    });

    it('deletes an owned transaction', async () => {
      const category = await createCategory(ana.token, 'Mercado');
      const created = await post(
        { query: CREATE, variables: { input: createInput(category.id) } },
        ana.token,
      );
      const id = created.body.data.createTransaction.id as string;

      const response = await post({ query: DELETE, variables: { id } }, ana.token);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteTransaction).toBe(true);
      expect(await database.transaction.count({ where: { id } })).toBe(0);
    });
  });
});

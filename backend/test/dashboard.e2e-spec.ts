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
    createCategory(input: $input) { id }
  }
`;

const CREATE_TRANSACTION = `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) { id }
  }
`;

const DASHBOARD = `
  query Dashboard {
    dashboard {
      balanceInCents
      expenseInCents
      incomeInCents
    }
  }
`;

const PASSWORD = 'correct horse battery';
const OCCURRED_AT = '2026-01-15T12:00:00.000Z';

interface Account {
  id: string;
  token: string;
}

describe('dashboard (e2e)', () => {
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
    return response.body.data.createCategory as { id: string };
  }

  async function createTransaction(
    token: string,
    input: { amountInCents: number; categoryId: string; description: string; type: 'EXPENSE' | 'INCOME' },
  ) {
    const response = await post(
      {
        query: CREATE_TRANSACTION,
        variables: { input: { ...input, occurredAt: OCCURRED_AT } },
      },
      token,
    );
    expect(response.body.errors).toBeUndefined();
  }

  describe('AC-001: summary uses only the principal and balance is income minus expense', () => {
    it('ignores another user ledger and keeps integer cents', async () => {
      const anaCategory = await createCategory(ana.token, 'Mercado');
      const brunoCategory = await createCategory(bruno.token, 'Aluguel');

      await createTransaction(ana.token, {
        amountInCents: 4_250_00,
        categoryId: anaCategory.id,
        description: 'Salário',
        type: 'INCOME',
      });
      await createTransaction(ana.token, {
        amountInCents: 1_005,
        categoryId: anaCategory.id,
        description: 'Jantar',
        type: 'EXPENSE',
      });
      await createTransaction(bruno.token, {
        amountInCents: 9_999_00,
        categoryId: brunoCategory.id,
        description: 'Aluguel de Bruno',
        type: 'EXPENSE',
      });

      const response = await post({ query: DASHBOARD }, ana.token);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.dashboard).toEqual({
        balanceInCents: 4_239_95,
        expenseInCents: 1_005,
        incomeInCents: 4_250_00,
      });
      expect(Number.isInteger(response.body.data.dashboard.balanceInCents)).toBe(true);
    });
  });

  describe('AC-002: no transactions return zeros', () => {
    it('returns integer zeros rather than nulls', async () => {
      const response = await post({ query: DASHBOARD }, ana.token);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.dashboard).toEqual({
        balanceInCents: 0,
        expenseInCents: 0,
        incomeInCents: 0,
      });
    });
  });

  it('rejects an anonymous caller', async () => {
    const response = await post({ query: DASHBOARD });

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});

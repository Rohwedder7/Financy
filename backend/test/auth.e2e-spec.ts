import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { captureOutput } from './factories/capture-output.js';
import { provisionDatabase } from './factories/database.js';

const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        id
        name
        email
        createdAt
      }
    }
  }
`;

const PASSWORD = 'correct horse battery';

describe('signUp (e2e)', () => {
  let app: INestApplication;
  let database: DatabaseService;
  let cleanup: () => void;

  beforeAll(async () => {
    const provisioned = provisionDatabase();
    cleanup = provisioned.cleanup;
    // Read by `DatabaseService` when Nest instantiates it, below.
    process.env.DATABASE_URL = provisioned.url;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    database = app.get(DatabaseService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    cleanup();
  });

  beforeEach(async () => {
    await database.user.deleteMany();
  });

  function signUp(input: Record<string, unknown>) {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: SIGN_UP, variables: { input } });
  }

  describe('AC-001: a valid sign-up stores a hash and opens a session', () => {
    it('returns a token and the created user', async () => {
      const response = await signUp({
        email: 'ana@financy.test',
        name: 'Ana',
        password: PASSWORD,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.signUp.user).toMatchObject({
        email: 'ana@financy.test',
        name: 'Ana',
      });
      expect(response.body.data.signUp.token).toEqual(expect.any(String));
    });

    it('persists an Argon2id hash that differs from the password', async () => {
      await signUp({ email: 'ana@financy.test', name: 'Ana', password: PASSWORD });

      const stored = await database.user.findUniqueOrThrow({
        where: { email: 'ana@financy.test' },
      });

      expect(stored.passwordHash).not.toBe(PASSWORD);
      expect(stored.passwordHash.startsWith('$argon2id$')).toBe(true);
    });
  });

  describe('AC-002: an equivalent e-mail never creates a second account', () => {
    it('rejects a duplicate that differs only by case and spacing', async () => {
      const first = await signUp({
        email: 'maria@financy.test',
        name: 'Maria',
        password: PASSWORD,
      });
      expect(first.body.errors).toBeUndefined();

      const second = await signUp({
        email: '  Maria@Financy.TEST  ',
        name: 'Maria',
        password: PASSWORD,
      });

      expect(second.body.errors?.[0]?.extensions?.code).toBe('CONFLICT');
      await expect(database.user.count()).resolves.toBe(1);
    });
  });

  describe('AC-003: neither the response nor the logs expose the credential', () => {
    it('keeps the password and the hash out of every byte written, on every path', async () => {
      // Nest routes `error` level to stderr, so watching stdout alone would
      // observe an empty buffer for exactly the paths that matter.
      const captured = captureOutput();

      let responses;
      try {
        responses = [
          await signUp({ email: 'ana@financy.test', name: 'Ana', password: PASSWORD }),
          // Duplicate, short, and wrongly-typed inputs each take a different
          // error path through validation, the resolver, and graphql-js itself.
          await signUp({ email: 'ana@financy.test', name: 'Ana', password: PASSWORD }),
          await signUp({ email: 'ana@financy.test', name: 'Ana', password: 'short' }),
          await signUp({ email: 'ana@financy.test', name: 'Ana', password: [PASSWORD] }),
          await signUp({ email: 'ana@financy.test', name: 'Ana', password: { value: PASSWORD } }),
        ];
      } finally {
        captured.restore();
      }

      const stored = await database.user.findUniqueOrThrow({
        where: { email: 'ana@financy.test' },
      });

      for (const response of responses) {
        const payload = JSON.stringify(response.body);
        expect(payload).not.toContain(PASSWORD);
        expect(payload).not.toContain(stored.passwordHash);
        expect(payload).not.toContain('passwordHash');
      }

      const logs = captured.text();
      expect(logs).not.toContain(PASSWORD);
      expect(logs).not.toContain(stored.passwordHash);
    });

    it('never returns a stack trace, whatever the environment', async () => {
      const response = await signUp({ email: 'nope', name: 'X', password: 'short' });

      expect(response.body.errors?.[0]?.extensions?.stacktrace).toBeUndefined();
    });

    it('does not publish passwordHash on the User type', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: '{ __type(name: "User") { fields { name } } }' });

      const fields: string[] = response.body.data.__type.fields.map(
        (field: { name: string }) => field.name,
      );

      expect(fields).not.toContain('passwordHash');
      expect(fields).toEqual(expect.arrayContaining(['id', 'name', 'email']));
    });
  });

  describe('BR-AUTH-005: password length is enforced', () => {
    it('rejects a password shorter than eight characters', async () => {
      const response = await signUp({
        email: 'curto@financy.test',
        name: 'Curto',
        password: '1234567',
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
      await expect(database.user.count()).resolves.toBe(0);
    });
  });
});

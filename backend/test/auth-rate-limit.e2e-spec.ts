import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { provisionDatabase } from './factories/database.js';

const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
    }
  }
`;

const LIMIT = 10;

/**
 * Kept in its own file so the throttler counter starts empty; the sibling
 * sign-up suite would otherwise spend part of the per-minute budget.
 */
describe('signUp rate limit (e2e)', () => {
  let app: INestApplication;
  let cleanup: () => void;

  beforeAll(async () => {
    const provisioned = provisionDatabase();
    cleanup = provisioned.cleanup;
    process.env.DATABASE_URL = provisioned.url;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    cleanup();
  });

  function signUp(index: number) {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: SIGN_UP,
        variables: {
          input: {
            email: `pessoa${index}@financy.test`,
            name: `Pessoa ${index}`,
            password: 'correct horse battery',
          },
        },
      });
  }

  // BR-AUTH-006: at most ten attempts per minute per origin.
  it('accepts ten attempts and refuses the eleventh', async () => {
    for (let index = 0; index < LIMIT; index += 1) {
      const allowed = await signUp(index);
      expect(allowed.body.errors, `attempt ${index + 1} should be allowed`).toBeUndefined();
    }

    const refused = await signUp(LIMIT);

    expect(refused.body.errors?.[0]?.extensions?.code).toBe('TOO_MANY_REQUESTS');
    expect(refused.body.data?.signUp).toBeFalsy();
    // The internal exception class name must not reach the client.
    expect(JSON.stringify(refused.body)).not.toContain('ThrottlerException');
  });
});

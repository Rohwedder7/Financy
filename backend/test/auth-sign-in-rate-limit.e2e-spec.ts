import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { provisionDatabase } from './factories/database.js';

const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) { token }
  }
`;

const SIGN_IN = `
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) { token }
  }
`;

const LIMIT = 10;
const PASSWORD = 'correct horse battery';

describe('signIn rate limit (e2e)', () => {
  let app: INestApplication;
  let cleanup: () => void;

  beforeAll(async () => {
    const provisioned = provisionDatabase();
    cleanup = provisioned.cleanup;
    process.env.DATABASE_URL = provisioned.url;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: SIGN_UP,
        variables: {
          input: { email: 'ana@financy.test', name: 'Ana', password: PASSWORD },
        },
      });
  });

  afterAll(async () => {
    await app.close();
    cleanup();
  });

  function signIn() {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: SIGN_IN,
        variables: { input: { email: 'ana@financy.test', password: PASSWORD } },
      });
  }

  it('accepts ten attempts and refuses the eleventh', async () => {
    for (let index = 0; index < LIMIT; index += 1) {
      const allowed = await signIn();
      expect(allowed.body.errors, `attempt ${index + 1} should be allowed`).toBeUndefined();
    }

    const refused = await signIn();

    expect(refused.body.errors?.[0]?.extensions?.code).toBe('TOO_MANY_REQUESTS');
    expect(refused.body.data?.signIn).toBeFalsy();
    expect(JSON.stringify(refused.body)).not.toContain('ThrottlerException');
  });
});

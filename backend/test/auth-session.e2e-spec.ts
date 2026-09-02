import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import type { INestApplication } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { provisionDatabase } from './factories/database.js';

const SIGN_UP = `
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) { token user { id } }
  }
`;

const SIGN_IN = `
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) { token user { id email name } }
  }
`;

const ME = `query { me { id email name } }`;

const PASSWORD = 'correct horse battery';
const ISSUER = 'financy-api';
const AUDIENCE = 'financy-web';

function hmacJwt(
  payload: Record<string, unknown>,
  algorithm: 'HS256' | 'HS512' = 'HS256',
): string {
  const header = Buffer.from(JSON.stringify({ alg: algorithm, typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const digest = algorithm === 'HS512' ? 'sha512' : 'sha256';
  const signature = createHmac(digest, process.env.JWT_SECRET as string)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function sessionClaims(sub: string, extra: Record<string, unknown> = {}) {
  const iat = Math.floor(Date.now() / 1000);

  return { aud: AUDIENCE, iat, iss: ISSUER, sub, ...extra };
}

interface Account {
  id: string;
  token: string;
}

describe('session (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let cleanup: () => void;
  let ana: Account;
  let bruno: Account;

  beforeAll(async () => {
    const provisioned = provisionDatabase();
    cleanup = provisioned.cleanup;
    process.env.DATABASE_URL = provisioned.url;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    jwt = app.get(JwtService);
    await app.init();

    ana = await register('ana@financy.test', 'Ana');
    bruno = await register('bruno@financy.test', 'Bruno');
  });

  afterAll(async () => {
    await app.close();
    cleanup();
  });

  function post(body: Record<string, unknown>, token?: string) {
    const call = request(app.getHttpServer()).post('/graphql');
    return token ? call.set('Authorization', `Bearer ${token}`).send(body) : call.send(body);
  }

  async function register(email: string, name: string): Promise<Account> {
    const response = await post({
      query: SIGN_UP,
      variables: { input: { email, name, password: PASSWORD } },
    });

    return { id: response.body.data.signUp.user.id, token: response.body.data.signUp.token };
  }

  function signIn(input: Record<string, unknown>) {
    return post({ query: SIGN_IN, variables: { input } });
  }

  function me(token?: string) {
    return post({ query: ME }, token);
  }

  describe('AC-001: valid credentials return an expiring token, invalid ones a generic refusal', () => {
    it('returns a token that carries only the subject and an expiry', async () => {
      const response = await signIn({ email: 'ana@financy.test', password: PASSWORD });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.signIn.user.id).toBe(ana.id);

      const claims = jwt.decode(response.body.data.signIn.token) as Record<string, unknown>;

      expect(claims.sub).toBe(ana.id);
      expect(claims.exp).toEqual(expect.any(Number));
      expect((claims.exp as number) - (claims.iat as number)).toBeGreaterThanOrEqual(14 * 60);
      expect((claims.exp as number) - (claims.iat as number)).toBeLessThanOrEqual(16 * 60);
      // BR-AUTH-004: nothing beyond the subject and the standard envelope.
      expect(Object.keys(claims).sort()).toEqual(['aud', 'exp', 'iat', 'iss', 'sub']);
    });

    it('normalizes the e-mail before looking the account up', async () => {
      const response = await signIn({ email: '  ANA@Financy.TEST  ', password: PASSWORD });

      expect(response.body.data.signIn.user.id).toBe(ana.id);
    });

    // BR-AUTH-003: a wrong password and an unknown account must be indistinguishable.
    it('answers a wrong password and an unknown account identically', async () => {
      const wrongPassword = await signIn({ email: 'ana@financy.test', password: 'not the one' });
      const unknownAccount = await signIn({ email: 'ninguem@financy.test', password: PASSWORD });

      expect(wrongPassword.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
      expect(unknownAccount.body.errors[0].message).toBe(wrongPassword.body.errors[0].message);
      expect(unknownAccount.body.errors[0].extensions).toEqual(
        wrongPassword.body.errors[0].extensions,
      );
    });
  });

  describe('AC-002: `me` trusts only the verified subject', () => {
    it('returns the account named by the token', async () => {
      const response = await me(ana.token);

      expect(response.body.data.me).toMatchObject({ email: 'ana@financy.test', id: ana.id });
    });

    it.each([
      ['no token', undefined],
      ['a malformed token', 'not-a-jwt'],
      ['an empty bearer value', ''],
      ['a token with only two segments', 'aaa.bbb'],
    ])('refuses %s', async (_label, token) => {
      const response = await me(token);

      expect(response.body.data?.me).toBeFalsy();
      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses a token whose payload was edited after signing', async () => {
      const [header, , signature] = ana.token.split('.');
      const forged = Buffer.from(JSON.stringify({ sub: bruno.id })).toString('base64url');

      const response = await me(`${header}.${forged}.${signature}`);

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses an expired token', async () => {
      const expired = await jwt.signAsync({ sub: ana.id }, { expiresIn: '-1s' });

      const response = await me(expired);

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses a well-formed token signed with another secret', async () => {
      const foreign = await jwt.signAsync({ sub: ana.id }, { secret: 'x'.repeat(48) });

      const response = await me(foreign);

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses a token whose subject no longer has an account', async () => {
      const orphan = await jwt.signAsync({ sub: 'this-id-never-existed' });

      const response = await me(orphan);

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses a token that has no expiry', async () => {
      const response = await me(hmacJwt(sessionClaims(ana.id)));

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses a token whose lifetime exceeds the short session window', async () => {
      const claims = sessionClaims(ana.id, { exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60 });
      const response = await me(hmacJwt(claims));

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('refuses a token signed with a different HMAC algorithm', async () => {
      const claims = sessionClaims(ana.id, { exp: Math.floor(Date.now() / 1000) + 15 * 60 });
      const response = await me(hmacJwt(claims, 'HS512'));

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('BR-SEC-001: identity comes from the signature, never from the request', () => {
    it('ignores extra claims and resolves the subject only', async () => {
      const token = await jwt.signAsync({
        email: 'bruno@financy.test',
        sub: ana.id,
        userId: bruno.id,
      });

      const response = await me(token);

      expect(response.body.data.me.id).toBe(ana.id);
      expect(response.body.data.me.email).toBe('ana@financy.test');
    });

    it('keeps two accounts apart', async () => {
      const [first, second] = await Promise.all([me(ana.token), me(bruno.token)]);

      expect(first.body.data.me.id).toBe(ana.id);
      expect(second.body.data.me.id).toBe(bruno.id);
      expect(first.body.data.me.id).not.toBe(second.body.data.me.id);
    });
  });

  describe('AC-003: protected surfaces do not accept an owner argument', () => {
    it('exposes `me` without any argument', async () => {
      const response = await post({
        query: '{ __type(name: "Query") { fields { name args { name } } } }',
      });

      const meField = response.body.data.__type.fields.find(
        (field: { name: string }) => field.name === 'me',
      );

      expect(meField.args).toEqual([]);
    });

    it.each(['SignInInput', 'SignUpInput'])('rejects userId on %s', async (typeName) => {
      const response = await post({
        query: `{ __type(name: "${typeName}") { inputFields { name } } }`,
      });

      const fields: string[] = response.body.data.__type.inputFields.map(
        (field: { name: string }) => field.name,
      );

      expect(fields).not.toContain('userId');
    });

    it('refuses a userId smuggled into the credentials input', async () => {
      const response = await post({
        query: `mutation { signIn(input: { email: "ana@financy.test", password: "${PASSWORD}", userId: "${bruno.id}" }) { token } }`,
      });

      expect(response.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
    });
  });
});

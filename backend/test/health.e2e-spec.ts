import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('GraphQL health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers the health query', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ health }' })
      .expect(200);

    expect(response.body).toEqual({ data: { health: 'ok' } });
  });

  it('allows introspection outside production', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ __schema { queryType { name } } }' })
      .expect(200);

    expect(response.body.data.__schema.queryType.name).toBe('Query');
  });
});

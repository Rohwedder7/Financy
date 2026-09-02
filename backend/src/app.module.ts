import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLError } from 'graphql';
import type { ValidationError } from 'class-validator';
import { join } from 'node:path';
import { AuthModule } from './auth/auth.module.js';
import { CategoryModule } from './categories/category.module.js';
import { formatGraphQLError } from './common/format-graphql-error.js';
import { allowGraphQLIntrospection } from './common/graphql-introspection.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { TransactionModule } from './transactions/transaction.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      // Guards and, later, the authenticated principal need both sides of the
      // HTTP exchange; the driver does not forward them by default.
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
      driver: ApolloDriver,
      formatError: formatGraphQLError,
      introspection: allowGraphQLIntrospection(),
      path: '/graphql',
      sortSchema: true,
    }),
    ThrottlerModule.forRoot([{ limit: 10, ttl: 60_000 }]),
    AuthModule,
    CategoryModule,
    DashboardModule,
    DatabaseModule,
    HealthModule,
    TransactionModule,
  ],
  providers: [
    // Registered here rather than in `main.ts` so tests exercise the same
    // validation the deployed application applies.
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        exceptionFactory: (errors: ValidationError[]) =>
          new GraphQLError('Invalid input.', {
            extensions: {
              code: 'BAD_USER_INPUT',
              fields: errors.map((error) => ({
                field: error.property,
                messages: Object.values(error.constraints ?? {}),
              })),
              // `validationError.value` is disabled below, so these messages
              // name constraints without ever quoting the rejected value.
              safe: true,
            },
          }),
        forbidNonWhitelisted: true,
        transform: true,
        // Without this the rejected value — including the plaintext password —
        // would travel back inside the validation error.
        validationError: { target: false, value: false },
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}

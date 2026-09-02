import { describe, expect, it } from 'vitest';
import { formatGraphQLError } from './format-graphql-error.js';

const PASSWORD = 'correct horse battery';

describe('formatGraphQLError', () => {
  it('replaces the graphql-js coercion message that echoes a rejected password', () => {
    const formatted = formatGraphQLError({
      extensions: { code: 'BAD_USER_INPUT' },
      message: `Variable "$i" got invalid value ["${PASSWORD}"] at "i.password"; String cannot represent a non string value: ["${PASSWORD}"]`,
    });

    expect(formatted.message).not.toContain(PASSWORD);
    expect(formatted.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('replaces an internal database message', () => {
    const formatted = formatGraphQLError({
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
      message: 'Invalid `prisma.user.create()` invocation: table `main.User` does not exist',
    });

    expect(formatted.message).toBe('Unexpected error.');
    expect(formatted.message).not.toContain('prisma');
  });

  it('keeps the text of an error this codebase authored', () => {
    const formatted = formatGraphQLError({
      extensions: {
        code: 'BAD_USER_INPUT',
        fields: [{ field: 'password', messages: ['password is too short'] }],
        safe: true,
      },
      message: 'Invalid input.',
    });

    expect(formatted.message).toBe('Invalid input.');
    expect(formatted.extensions?.fields).toBeDefined();
  });

  it('strips the safe marker and the stack trace from what the client sees', () => {
    const formatted = formatGraphQLError({
      extensions: { code: 'CONFLICT', safe: true, stacktrace: ['at somewhere'] },
      message: 'An account with this e-mail already exists.',
    });

    expect(formatted.extensions).not.toHaveProperty('safe');
    expect(formatted.extensions).not.toHaveProperty('stacktrace');
  });

  it('keeps a validation error about the query document itself', () => {
    const message = 'Cannot query field "passwordHash" on type "User".';
    const formatted = formatGraphQLError({
      extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      message,
    });

    expect(formatted.message).toBe(message);
  });
});

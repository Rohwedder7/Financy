import { describe, expect, it } from 'vitest';
import { allowGraphQLIntrospection } from './graphql-introspection.js';

describe('allowGraphQLIntrospection', () => {
  it('is off in production and on otherwise', () => {
    expect(allowGraphQLIntrospection('production')).toBe(false);
    expect(allowGraphQLIntrospection('development')).toBe(true);
    expect(allowGraphQLIntrospection('test')).toBe(true);
  });
});

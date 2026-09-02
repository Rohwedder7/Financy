/** Introspection stays available for local debugging and tests, never in production. */
export function allowGraphQLIntrospection(nodeEnv = process.env.NODE_ENV): boolean {
  return nodeEnv !== 'production';
}

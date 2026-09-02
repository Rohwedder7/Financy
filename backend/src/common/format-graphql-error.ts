import type { GraphQLFormattedError } from 'graphql';

/**
 * The contract forbids internal messages, SQL and stack traces from reaching a
 * client. Only errors this codebase authored — marked `safe` — keep their text.
 *
 * The allowlist is deliberately inverted: graphql-js echoes the rejected value
 * into variable coercion messages, so a password submitted as an array would be
 * reflected back in plaintext if unknown messages were trusted.
 */
const GENERIC_MESSAGE_BY_CODE: Record<string, string> = {
  BAD_USER_INPUT: 'The submitted data is invalid.',
  CATEGORY_IN_USE: 'This category still has transactions.',
  CONFLICT: 'The resource already exists.',
  FORBIDDEN: 'You cannot access this resource.',
  NOT_FOUND: 'Resource not found.',
  TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
  UNAUTHENTICATED: 'Authentication is required.',
};

/** These describe the query document the client itself sent, never its variables. */
const DOCUMENT_LEVEL_CODES = new Set(['GRAPHQL_PARSE_FAILED', 'GRAPHQL_VALIDATION_FAILED']);

export function formatGraphQLError(error: GraphQLFormattedError): GraphQLFormattedError {
  // Both are destructured only to keep them out of `extensions`.
  const { safe, stacktrace: _stacktrace, ...extensions } = error.extensions ?? {};
  const code = typeof extensions.code === 'string' ? extensions.code : 'INTERNAL_SERVER_ERROR';

  if (safe === true || DOCUMENT_LEVEL_CODES.has(code)) {
    return { ...error, extensions };
  }

  return {
    extensions,
    locations: error.locations,
    message: GENERIC_MESSAGE_BY_CODE[code] ?? 'Unexpected error.',
    path: error.path,
  };
}

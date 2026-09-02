/**
 * BR-CAT-004 / GRAPHQL_CONTRACT: optional colour is `#` plus six hex digits.
 * Stored uppercase so two equivalent inputs do not diverge in the database.
 */
export const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

export function normalizeHexColor(value: string): string {
  return value.replace(/\p{Cf}/gu, '').trim().toUpperCase();
}

export function toOptionalHexColor(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalized = normalizeHexColor(value);
  return normalized === '' ? null : normalized;
}

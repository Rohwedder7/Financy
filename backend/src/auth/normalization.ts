/** BR-AUTH-001: accounts are compared by their normalized e-mail form. */
export function normalizeEmail(email: string): string {
  // Zero-width and other Unicode format characters are not whitespace, so they
  // survive `trim()` and would let a visually identical address register twice.
  return email.replace(/\p{Cf}/gu, '').trim().toLowerCase();
}

export function normalizeName(name: string): string {
  return name.trim();
}

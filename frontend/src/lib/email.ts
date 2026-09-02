/** BR-AUTH-001: compare accounts by the stored, normalized form. */
export function normalizeEmail(email: string): string {
  return email.replace(/\p{Cf}/gu, '').trim().toLowerCase()
}

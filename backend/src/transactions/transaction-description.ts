/** BR-TXN-005: a description is compared and stored after edge normalization. */
export function displayTransactionDescription(value: string): string {
  return value.replace(/\p{Cf}/gu, '').trim();
}

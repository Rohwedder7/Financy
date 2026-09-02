/**
 * BR-CAT-001: uniqueness is case-insensitive and ignores surrounding spaces.
 * The displayable name is a separate, trimmed form kept by the caller.
 */
export function normalizeCategoryName(name: string): string {
  return name.replace(/\p{Cf}/gu, '').trim().toLowerCase();
}

export function displayCategoryName(name: string): string {
  return name.replace(/\p{Cf}/gu, '').trim();
}

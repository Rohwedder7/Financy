import type { Prisma } from '../generated/prisma/client.js';

export const PUBLIC_CATEGORY_FIELDS = {
  color: true,
  createdAt: true,
  id: true,
  name: true,
} as const satisfies Prisma.CategorySelect;

import type { Prisma } from '../generated/prisma/client.js';
import { PUBLIC_CATEGORY_FIELDS } from '../categories/public-category.js';

export const PUBLIC_TRANSACTION_FIELDS = {
  amountInCents: true,
  category: { select: PUBLIC_CATEGORY_FIELDS },
  categoryId: true,
  createdAt: true,
  description: true,
  id: true,
  occurredAt: true,
  type: true,
} as const satisfies Prisma.TransactionSelect;

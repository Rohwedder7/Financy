import { registerEnumType } from '@nestjs/graphql';
import { TransactionType } from '../generated/prisma/enums.js';

registerEnumType(TransactionType, {
  description: 'INCOME increases the balance; EXPENSE decreases it. The stored amount stays positive.',
  name: 'TransactionType',
});

export { TransactionType };

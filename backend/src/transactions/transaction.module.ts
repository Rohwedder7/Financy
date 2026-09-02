import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TransactionResolver } from './transaction.resolver.js';
import { TransactionService } from './transaction.service.js';

@Module({
  imports: [AuthModule],
  providers: [TransactionResolver, TransactionService],
})
export class TransactionModule {}

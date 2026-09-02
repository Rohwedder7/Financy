import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type { DashboardTotals } from './summarize-ledger.js';
import { summarizeLedger } from './summarize-ledger.js';

@Injectable()
export class DashboardService {
  constructor(private readonly database: DatabaseService) {}

  async forUser(userId: string): Promise<DashboardTotals> {
    const rows = await this.database.transaction.findMany({
      select: { amountInCents: true, type: true },
      where: { userId },
    });

    return summarizeLedger(rows);
  }
}

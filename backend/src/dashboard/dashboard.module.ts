import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DashboardResolver } from './dashboard.resolver.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [AuthModule],
  providers: [DashboardResolver, DashboardService],
})
export class DashboardModule {}

import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import type { UserModel } from '../auth/models/user.model.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardModel } from './models/dashboard.model.js';

@UseGuards(GqlAuthGuard)
@Resolver(() => DashboardModel)
export class DashboardResolver {
  constructor(private readonly summaries: DashboardService) {}

  @Query(() => DashboardModel, {
    description: 'Balance, income and expense totals owned by the authenticated user.',
  })
  dashboard(@CurrentUser() user: UserModel): Promise<DashboardModel> {
    return this.summaries.forUser(user.id);
  }
}

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Dashboard')
export class DashboardModel {
  @Field(() => Int, { description: 'Income minus expense for the authenticated user, in cents.' })
  balanceInCents!: number;

  @Field(() => Int, { description: 'Sum of EXPENSE amounts owned by the authenticated user, in cents.' })
  expenseInCents!: number;

  @Field(() => Int, { description: 'Sum of INCOME amounts owned by the authenticated user, in cents.' })
  incomeInCents!: number;
}

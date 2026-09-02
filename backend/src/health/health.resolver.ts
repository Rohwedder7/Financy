import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, { description: 'Confirms that the GraphQL API is available.' })
  health(): string {
    return 'ok';
  }
}

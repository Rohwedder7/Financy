import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * Public projection of a user. `passwordHash` is intentionally absent: adding it
 * here would publish the credential through the generated GraphQL schema.
 */
@ObjectType('User')
export class UserModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  createdAt!: Date;
}

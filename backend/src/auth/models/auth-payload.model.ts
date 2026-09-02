import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model.js';

@ObjectType('AuthPayload')
export class AuthPayloadModel {
  @Field({ description: 'Signed JWT to be sent as `Authorization: Bearer <token>`.' })
  token!: string;

  @Field(() => UserModel)
  user!: UserModel;
}

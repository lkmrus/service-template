import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('User')
export class UserModel {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

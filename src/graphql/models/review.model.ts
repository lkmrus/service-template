import { Field, Int, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('Review')
export class ReviewModel {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field()
  userId: string;

  @Field()
  review: string;

  @Field({ nullable: true })
  orderId?: string | null;

  @Field(() => Int)
  rate: number;

  @Field()
  lang: string;

  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

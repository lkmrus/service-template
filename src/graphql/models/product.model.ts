import { Field, Int, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { JSONScalar } from '../scalars/json.scalar';

@ObjectType('Product')
export class ProductModel {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => JSONScalar)
  properties: Record<string, unknown>;

  @Field(() => JSONScalar)
  prices: Record<string, number>;

  @Field(() => Int)
  quantity: number;

  @Field()
  isActive: boolean;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: Record<string, unknown>;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

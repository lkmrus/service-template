import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { JSONScalar } from '../scalars/json.scalar';

@ObjectType('CartLineItem')
export class CartLineItemModel {
  @Field()
  id: string;

  @Field({ nullable: true })
  cartId?: string | null;

  @Field({ nullable: true })
  preOrderId?: string | null;

  @Field({ nullable: true })
  externalUuid?: string | null;

  @Field(() => JSONScalar, { nullable: true })
  productSelectionParams?: unknown;

  @Field({ nullable: true })
  priceUSD?: number | null;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: unknown;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

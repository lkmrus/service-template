import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { JSONScalar } from '../scalars/json.scalar';
import { CartLineItemModel } from './cart-line-item.model';

@ObjectType('Cart')
export class CartModel {
  @Field()
  id: string;

  @Field({ nullable: true })
  ownerId?: string | null;

  @Field({ nullable: true })
  authorId?: string | null;

  @Field({ nullable: true })
  couponCode?: string | null;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: unknown;

  @Field(() => [CartLineItemModel], { nullable: true })
  lineItems?: CartLineItemModel[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

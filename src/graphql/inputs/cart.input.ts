import { Field, Float, InputType } from '@nestjs/graphql';
import { JSONScalar } from '../scalars/json.scalar';

@InputType()
export class CartFilterInput {
  @Field({ nullable: true })
  cartId?: string;

  @Field({ nullable: true })
  ownerId?: string;
}

@InputType()
export class ProductSnapshotInput {
  @Field()
  id: string;

  @Field(() => Float)
  priceUSD: number;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: Record<string, unknown>;
}

@InputType()
export class AddCartLineItemInput {
  @Field({ nullable: true })
  cartId?: string;

  @Field({ nullable: true })
  ownerId?: string;

  @Field({ nullable: true })
  preOrderId?: string;

  @Field({ nullable: true })
  productId?: string;

  @Field(() => ProductSnapshotInput, { nullable: true })
  product?: ProductSnapshotInput;

  @Field(() => Float, { nullable: true })
  priceUSD?: number;

  @Field({ nullable: true })
  externalUuid?: string;

  @Field(() => JSONScalar, { nullable: true })
  productSelectionParams?: Record<string, unknown>;

  @Field(() => JSONScalar, { nullable: true })
  metadata?: Record<string, unknown>;
}

@InputType()
export class RemoveCartLineItemInput {
  @Field({ nullable: true })
  cartId?: string;

  @Field({ nullable: true })
  ownerId?: string;

  @Field()
  lineItemId: string;
}

import { Field, Float, InputType } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { LineItemCode } from '../../carts/enums/line-item-code.enum';
import { JSONScalar } from '../scalars/json.scalar';

registerEnumType(LineItemCode, {
  name: 'LineItemCode',
});

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

  @Field(() => LineItemCode, { nullable: true, defaultValue: LineItemCode.REGULAR_ITEM })
  typeCode?: LineItemCode;

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

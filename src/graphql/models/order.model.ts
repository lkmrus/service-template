import {
  Field,
  Float,
  Int,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { JSONScalar } from '../scalars/json.scalar';
import { CalculatedCommission } from '../../orders/domain/types/commission.types';
import { CalculatedCommissionModel } from './commission.model';

@ObjectType('Order')
export class OrderModel {
  @Field()
  id: string;

  @Field({ nullable: true })
  preOrderId?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field()
  userId: string;

  @Field()
  sellerId: string;

  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  currency: string;

  @Field(() => JSONScalar)
  commissions: Record<string, unknown>;

  @Field(() => CalculatedCommissionModel, { nullable: true })
  calculatedCommissions?: CalculatedCommission;

  @Field()
  status: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

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

@ObjectType('PreOrder')
export class PreOrderModel {
  @Field()
  id: string;

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

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

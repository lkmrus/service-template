import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('CalculatedCommission')
export class CalculatedCommissionModel {
  @Field(() => Float)
  fix: number;

  @Field(() => Float)
  percentageAmount: number;

  @Field(() => Float)
  total: number;
}

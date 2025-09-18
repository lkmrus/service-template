import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SubscriptionResult')
export class SubscriptionResultModel {
  @Field()
  subscriptionId: string;

  @Field()
  status: string;
}

@ObjectType('SubscriptionStatus')
export class SubscriptionStatusModel {
  @Field()
  status: string;
}

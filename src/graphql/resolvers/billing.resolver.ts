import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CreateSubscriptionUseCase } from '../../billing/application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../billing/application/use-cases/cancel-subscription.use-case';
import { CreateSubscriptionInput } from '../inputs/billing.input';
import {
  SubscriptionResultModel,
  SubscriptionStatusModel,
} from '../models/subscription.model';

@Resolver()
export class BillingResolver {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
  ) {}

  @Mutation(() => SubscriptionResultModel)
  async createSubscription(
    @Args('input') input: CreateSubscriptionInput,
  ): Promise<SubscriptionResultModel> {
    return this.createSubscriptionUseCase.execute(
      input.userId,
      input.planId,
      input.preOrderId,
    );
  }

  @Mutation(() => SubscriptionStatusModel)
  async cancelSubscription(
    @Args('subscriptionId') subscriptionId: string,
  ): Promise<SubscriptionStatusModel> {
    return this.cancelSubscriptionUseCase.execute(subscriptionId);
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PAYMENT_GATEWAY_TOKEN,
  PaymentGateway,
} from '../../infrastructure/payment/payment-gateway.interface';
import { SubscriptionStatusChangedEvent } from '../../domain/events/subscription-status-changed.event';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository';
import {
  PLAN_REPOSITORY,
  PlanRepository,
} from '../../domain/repositories/plan.repository';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/repositories/customer.repository';

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGateway,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Cancels a subscription.
   * @param subscriptionId - The ID of the subscription to cancel.
   * @returns The new status of the subscription.
   */
  async execute(subscriptionId: string) {
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    await this.paymentGateway.cancelSubscription(subscriptionId);

    const previousStatus = subscription.status;
    subscription.status = 'canceled';
    subscription.endDate = new Date();

    await this.subscriptionRepository.update(subscription);

    const plan = await this.planRepository.findById(subscription.planId);
    const customer = await this.customerRepository.findByCustomerId(
      subscription.customerId,
    );

    this.eventEmitter.emit(
      'subscription.status.changed',
      new SubscriptionStatusChangedEvent(
        customer?.userId ?? 'unknown-user',
        previousStatus,
        subscription.status,
        plan?.planId ?? subscription.planId,
      ),
    );

    return { status: subscription.status };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PAYMENT_GATEWAY_TOKEN,
  PaymentGateway,
} from '../../infrastructure/payment/payment-gateway.interface';
import { SubscriptionStatusChangedEvent } from '../../domain/events/subscription-status-changed.event';

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Cancels a subscription.
   * @param subscriptionId - The ID of the subscription to cancel.
   * @returns The new status of the subscription.
   */
  async execute(subscriptionId: string) {
    await this.paymentGateway.cancelSubscription(subscriptionId);

    // In a real implementation, we would fetch the userId and planId from the database
    const userId = 'user_123';
    const planId = 'plan_123';

    this.eventEmitter.emit(
      'subscription.status.changed',
      new SubscriptionStatusChangedEvent(userId, 'active', 'canceled', planId),
    );

    return { status: 'canceled' };
  }
}

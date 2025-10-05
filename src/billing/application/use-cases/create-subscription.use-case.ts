import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PAYMENT_GATEWAY_TOKEN,
  PaymentGateway,
} from '../../infrastructure/payment/payment-gateway.interface';
import { TransactionsService } from '../../../transactions/application/transactions/transactions.service';
import {
  TransactionStatus,
  PaymentMethod,
} from '../../../transactions/domain/enums/transaction.enums';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/repositories/customer.repository';
import {
  PLAN_REPOSITORY,
  PlanRepository,
} from '../../domain/repositories/plan.repository';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository';
import { SubscriptionStatusChangedEvent } from '../../domain/events/subscription-status-changed.event';

export const BILLING_SERVICE_ACCOUNT_ID_TOKEN = Symbol(
  'BILLING_SERVICE_ACCOUNT_ID_TOKEN',
);

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGateway,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly transactionsService: TransactionsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(BILLING_SERVICE_ACCOUNT_ID_TOKEN)
    private readonly serviceAccountId: string,
  ) {}

  /**
   * Creates a new subscription for a user.
   * @param userId - The ID of the user.
   * @param planId - The ID of the subscription plan.
   * @param preOrderId - The ID of the pre-order.
   * @returns The ID and status of the new subscription.
   */
  async execute(userId: string, planId: string, preOrderId: string) {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException(
        `Billing customer for user ${userId} not found`,
      );
    }

    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    const { subscriptionId, status } =
      await this.paymentGateway.createSubscription(
        customer.customerId,
        plan.planId,
      );

    const subscription = await this.subscriptionRepository.create({
      subscriptionId,
      customerId: customer.customerId,
      planId: plan.planId,
      status: status as 'active' | 'canceled' | 'past_due',
      startDate: new Date(),
      endDate: null,
      nextPaymentDate: this.calculateNextPaymentDate(plan.interval),
    });

    const transaction = await this.transactionsService.createTransaction({
      userId,
      serviceAccountId: this.serviceAccountId,
      amountOut: plan.price,
      currency: plan.currency,
      status: TransactionStatus.COMPLETED,
      paymentMethod: PaymentMethod.BALANCE,
    });

    this.eventEmitter.emit('transaction.completed', {
      preOrderId,
      transactionId: transaction.id,
    });

    this.eventEmitter.emit(
      'subscription.status.changed',
      new SubscriptionStatusChangedEvent(
        userId,
        'pending',
        subscription.status,
        plan.planId,
      ),
    );

    return {
      subscriptionId: subscription.subscriptionId,
      status: subscription.status,
    };
  }

  private calculateNextPaymentDate(interval: 'month' | 'year'): Date | null {
    const next = new Date();
    if (interval === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }
    return next;
  }
}

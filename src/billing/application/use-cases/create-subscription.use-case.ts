import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PAYMENT_GATEWAY_TOKEN, PaymentGateway } from '../../infrastructure/payment/payment-gateway.interface';
import { TransactionsService } from '../../../transactions/application/transactions/transactions.service';
import { TransactionStatus, PaymentMethod } from '../../../transactions/domain/enums/transaction.enums';

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGateway,
    private readonly transactionsService: TransactionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new subscription for a user.
   * @param userId - The ID of the user.
   * @param planId - The ID of the subscription plan.
   * @param preOrderId - The ID of the pre-order.
   * @returns The ID and status of the new subscription.
   */
  async execute(userId: string, planId: string, preOrderId: string) {
    // For now, we'll assume the user exists and has a customerId
    const customerId = 'cus_123'; // a real implementation would fetch this from the db
    const { subscriptionId, status } = await this.paymentGateway.createSubscription(customerId, planId);

    // For now, we'll assume a full payment from balance
    // In a real implementation, we would get the plan amount and currency from the planId
    const amount = 100;
    const currency = 'USD';
    const serviceAccountId = 'service_account_123';

    const transaction = await this.transactionsService.createTransaction({
      userId,
      serviceAccountId,
      amountOut: amount,
      currency,
      status: TransactionStatus.COMPLETED,
      paymentMethod: PaymentMethod.BALANCE,
    });

    this.eventEmitter.emit('transaction.completed', {
      preOrderId,
      transactionId: transaction.id,
    });

    return { subscriptionId, status };
  }
}

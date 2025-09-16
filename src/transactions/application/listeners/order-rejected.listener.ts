import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatus } from '../../domain/enums/transaction.enums';

@Injectable()
export class OrderRejectedListener {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Handles the order.rejected event.
   * @param payload - The event payload, containing the orderId and transactionId.
   */
  @OnEvent('order.rejected')
  async handleOrderRejectedEvent(payload: {
    orderId: string;
    transactionId: string;
  }) {
    const transaction = await this.transactionsService.findOne(
      payload.transactionId,
    );

    if (transaction) {
      transaction.status = TransactionStatus.CANCELED;
      await this.transactionsService.update(transaction.id, transaction);

      // In a real implementation, we would also refund the user by creating a credit transaction
      await this.transactionsService.createTransaction({
        userId: transaction.userId,
        serviceAccountId: transaction.serviceAccountId,
        amountIn: transaction.amountOut, // Refund the debited amount
        currency: transaction.currency,
        status: TransactionStatus.COMPLETED,
        paymentMethod: transaction.paymentMethod,
        externalId: transaction.externalId,
      });
    }
  }
}

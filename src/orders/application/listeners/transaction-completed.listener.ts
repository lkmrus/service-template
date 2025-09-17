import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderService } from '../order.service';
import { PreOrderService } from '../pre-order.service';

@Injectable()
export class TransactionCompletedListener {
  constructor(
    private readonly orderService: OrderService,
    private readonly preOrderService: PreOrderService,
  ) {}

  /**
   * Handles the transaction.completed event.
   * @param payload - The event payload, containing the preOrderId and transactionId.
   */
  @OnEvent('transaction.completed')
  async handleTransactionCompletedEvent(payload: {
    preOrderId: string;
    transactionId: string;
  }) {
    const preOrder = await this.preOrderService.findById(payload.preOrderId);

    await this.orderService.createOrderFromPreOrder(
      preOrder,
      payload.transactionId,
    );
  }
}

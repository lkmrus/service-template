import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../domain/entities/order.entity';
import { PreOrder } from '../domain/entities/pre-order.entity';
import { OrderStatus } from '../domain/enums/order.enums';
import { OrderRejectedEvent } from '../domain/events/order-rejected.event';

@Injectable()
export class OrderService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Creates a new order from a pre-order.
   * @param preOrder - The pre-order to create the order from.
   * @param transactionId - The ID of the related transaction.
   * @returns The created order.
   */
  createOrderFromPreOrder(
    preOrder: PreOrder,
    transactionId: string,
  ): Order {
    const order = {
      ...preOrder,
      preOrderId: preOrder.id,
      transactionId,
      status: OrderStatus.PAID,
    } as Order;

    // In a real implementation, we would save the order to the database
    return order;
  }

  /**
   * Rejects an order.
   * @param order - The order to reject.
   * @returns The updated order.
   */
  async rejectOrder(order: Order): Promise<Order> {
    order.status = OrderStatus.REJECTED;
    // In a real implementation, we would update the order in the database

    this.eventEmitter.emit(
      'order.rejected',
      new OrderRejectedEvent(order.id, order.transactionId),
    );

    return order;
  }
}

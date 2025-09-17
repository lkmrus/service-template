import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../domain/entities/order.entity';
import { PreOrder } from '../domain/entities/pre-order.entity';
import { OrderStatus } from '../domain/enums/order.enums';
import { OrderRejectedEvent } from '../domain/events/order-rejected.event';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../domain/repositories/order.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  /**
   * Creates a new order from a pre-order.
   * @param preOrder - The pre-order to create the order from.
   * @param transactionId - The ID of the related transaction.
   * @returns The created order.
   */
  async createOrderFromPreOrder(
    preOrder: PreOrder,
    transactionId: string,
  ): Promise<Order> {
    const order = await this.orderRepository.create({
      preOrderId: preOrder.id,
      transactionId,
      userId: preOrder.userId,
      sellerId: preOrder.sellerId,
      productId: preOrder.productId,
      quantity: preOrder.quantity,
      totalPrice: preOrder.totalPrice,
      currency: preOrder.currency,
      commissions: preOrder.commissions,
      calculatedCommissions: preOrder.calculatedCommissions ?? null,
      status: OrderStatus.PAID,
    });

    return order;
  }

  /**
   * Rejects an order.
   * @param order - The order to reject.
   * @returns The updated order.
   */
  async rejectOrder(order: Order): Promise<Order> {
    order.status = OrderStatus.REJECTED;
    order.updatedAt = new Date();

    const persisted = await this.orderRepository.save(order);

    this.eventEmitter.emit(
      'order.rejected',
      new OrderRejectedEvent(persisted.id, persisted.transactionId ?? ''),
    );

    return persisted;
  }
}

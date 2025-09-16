import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { PreOrderService } from '../../application/pre-order.service';
import { OrderService } from '../../application/order.service';
import { PreOrder } from '../../domain/entities/pre-order.entity';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order.enums';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly preOrderService: PreOrderService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Creates a new pre-order.
   * @param data - The data for the new pre-order.
   * @returns The created pre-order with the calculated total price.
   */
  @Post('pre-order')
  async createPreOrder(@Body() data: Partial<PreOrder>): Promise<PreOrder> {
    const preOrder = await this.preOrderService.createPreOrder(data);
    return this.preOrderService.calculateTotalPrice(preOrder);
  }

  /**
   * (Superuser) Completes an order.
   * @param id - The ID of the order to complete.
   * @returns The updated order.
   */
  @Patch(':id/complete')
  async completeOrder(@Param('id') id: string): Promise<Order> {
    // In a real implementation, we would update the order in the database
    return { id, status: OrderStatus.COMPLETED } as Order;
  }

  /**
   * (Superuser) Rejects an order.
   * @param id - The ID of the order to reject.
   * @returns The updated order.
   */
  @Patch(':id/reject')
  async rejectOrder(@Param('id') id: string): Promise<Order> {
    // In a real implementation, we would fetch the order from the database
    const order = { id, transactionId: 'transaction_123' } as Order;
    return this.orderService.rejectOrder(order);
  }
}

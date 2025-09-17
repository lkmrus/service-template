import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order.enums';

@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [];

  async findOne(id: string): Promise<Order | undefined> {
    return this.orders.find((order) => order.id === id);
  }

  async rejectOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = OrderStatus.REJECTED;
    return order;
  }
}

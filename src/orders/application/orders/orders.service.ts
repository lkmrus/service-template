import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order.enums';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../../domain/repositories/order.repository';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async findOne(id: string): Promise<Order | undefined> {
    return this.orderRepository.findById(id);
  }

  async rejectOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = OrderStatus.REJECTED;
    order.updatedAt = new Date();
    return this.orderRepository.save(order);
  }

  async completeOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = OrderStatus.COMPLETED;
    order.updatedAt = new Date();
    return this.orderRepository.save(order);
  }
}

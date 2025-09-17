import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PreOrderService } from '../../application/pre-order.service';
import { OrdersService } from '../../application/orders/orders.service';
import { Order } from '../../domain/entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
import { OrderOwnerOrSuperAdminGuard } from './guards/order-owner-or-super-admin.guard';
import { CreatePreOrderDto } from './dto/create-pre-order.dto';
import { PreOrder } from '../../domain/entities/pre-order.entity';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly preOrderService: PreOrderService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Creates a new pre-order.
   * @param data - The data for the new pre-order.
   * @returns The created pre-order with the calculated total price.
   */
  @Post('pre-order')
  async createPreOrder(@Body() data: CreatePreOrderDto): Promise<PreOrder> {
    return this.preOrderService.createPreOrder(data);
  }

  /**
   * (Superuser) Completes an order.
   * @param id - The ID of the order to complete.
   * @returns The updated order.
   */
  @Patch(':id/complete')
  @UseGuards(AuthGuard('jwt'), OrderOwnerOrSuperAdminGuard)
  async completeOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.completeOrder(id);
  }

  /**
   * (Superuser) Rejects an order.
   * @param id - The ID of the order to reject.
   * @returns The updated order.
   */
  @Patch(':id/reject')
  @UseGuards(AuthGuard('jwt'), OrderOwnerOrSuperAdminGuard)
  async rejectOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.rejectOrder(id);
  }
}

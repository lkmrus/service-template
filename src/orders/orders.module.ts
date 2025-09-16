import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/orders/orders.controller';
import { PreOrderService } from './application/pre-order.service';
import { OrderService } from './application/order.service';
import { TransactionCompletedListener } from './application/listeners/transaction-completed.listener';

@Module({
  providers: [PreOrderService, OrderService, TransactionCompletedListener],
  controllers: [OrdersController],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/orders/orders.controller';
import { PreOrderService } from './application/pre-order.service';
import { OrderService } from './application/order.service';
import { OrdersService } from './application/orders/orders.service';
import { TransactionCompletedListener } from './application/listeners/transaction-completed.listener';
import { SuperAdminModule } from '../super-admin/super-admin.module';

@Module({
  imports: [SuperAdminModule],
  providers: [
    PreOrderService,
    OrderService,
    OrdersService,
    TransactionCompletedListener,
  ],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

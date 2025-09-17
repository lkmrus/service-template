import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/orders/orders.controller';
import { PreOrderService } from './application/pre-order.service';
import { OrderService } from './application/order.service';
import { OrdersService } from './application/orders/orders.service';
import { TransactionCompletedListener } from './application/listeners/transaction-completed.listener';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { OrderOwnerOrSuperAdminGuard } from './presentation/orders/guards/order-owner-or-super-admin.guard';
import { PRE_ORDER_REPOSITORY } from './domain/repositories/pre-order.repository';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository';
import { PrismaPreOrderRepository } from './infrastructure/persistence/prisma-pre-order.repository';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';

@Module({
  imports: [SuperAdminModule],
  providers: [
    PreOrderService,
    OrderService,
    OrdersService,
    TransactionCompletedListener,
    OrderOwnerOrSuperAdminGuard,
    { provide: PRE_ORDER_REPOSITORY, useClass: PrismaPreOrderRepository },
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
  ],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

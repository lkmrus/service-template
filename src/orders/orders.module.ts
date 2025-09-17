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
import { SupabasePreOrderRepository } from './infrastructure/persistence/supabase-pre-order.repository';
import { SupabaseOrderRepository } from './infrastructure/persistence/supabase-order.repository';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/config';

@Module({
  imports: [SuperAdminModule],
  providers: [
    PreOrderService,
    OrderService,
    OrdersService,
    TransactionCompletedListener,
    OrderOwnerOrSuperAdminGuard,
    PrismaPreOrderRepository,
    PrismaOrderRepository,
    SupabasePreOrderRepository,
    SupabaseOrderRepository,
    {
      provide: PRE_ORDER_REPOSITORY,
      useFactory: (
        configService: ConfigService<AppConfig>,
        prismaRepo: PrismaPreOrderRepository,
        supabaseRepo: SupabasePreOrderRepository,
      ) => {
        const provider =
          configService.get<'supabase' | 'prisma'>('dataProvider') ??
          'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaPreOrderRepository,
        SupabasePreOrderRepository,
      ],
    },
    {
      provide: ORDER_REPOSITORY,
      useFactory: (
        configService: ConfigService<AppConfig>,
        prismaRepo: PrismaOrderRepository,
        supabaseRepo: SupabaseOrderRepository,
      ) => {
        const provider =
          configService.get<'supabase' | 'prisma'>('dataProvider') ??
          'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [ConfigService, PrismaOrderRepository, SupabaseOrderRepository],
    },
  ],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

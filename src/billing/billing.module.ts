import { Module } from '@nestjs/common';
import { BillingController } from './presentation/billing/billing.controller';
import { StripeAdapter } from './infrastructure/payment/stripe.adapter';
import { PAYMENT_GATEWAY_TOKEN } from './infrastructure/payment/payment-gateway.interface';
import { UserCreatedListener } from './application/listeners/user-created.listener';
import { TransactionCompletedBalanceListener } from './application/listeners/transaction-completed-balance.listener';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { TransactionsModule } from '../transactions/transactions.module';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository';
import { PLAN_REPOSITORY } from './domain/repositories/plan.repository';
import { SUBSCRIPTION_REPOSITORY } from './domain/repositories/subscription.repository';
import { INVOICE_REPOSITORY } from './domain/repositories/invoice.repository';
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository';
import { BALANCE_REPOSITORY } from './domain/repositories/balance.repository';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository';
import { PrismaPlanRepository } from './infrastructure/persistence/prisma-plan.repository';
import { PrismaSubscriptionRepository } from './infrastructure/persistence/prisma-subscription.repository';
import { PrismaInvoiceRepository } from './infrastructure/persistence/prisma-invoice.repository';
import { PrismaPaymentRepository } from './infrastructure/persistence/prisma-payment.repository';
import { PrismaBalanceRepository } from './infrastructure/persistence/prisma-balance.repository';
import { SupabaseCustomerRepository } from './infrastructure/persistence/supabase-customer.repository';
import { SupabasePlanRepository } from './infrastructure/persistence/supabase-plan.repository';
import { SupabaseSubscriptionRepository } from './infrastructure/persistence/supabase-subscription.repository';
import { SupabaseInvoiceRepository } from './infrastructure/persistence/supabase-invoice.repository';
import { SupabasePaymentRepository } from './infrastructure/persistence/supabase-payment.repository';
import { SupabaseBalanceRepository } from './infrastructure/persistence/supabase-balance.repository';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/config';

@Module({
  imports: [TransactionsModule],
  controllers: [BillingController],
  providers: [
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      useClass: StripeAdapter,
    },
    UserCreatedListener,
    TransactionCompletedBalanceListener,
    CreateSubscriptionUseCase,
    CancelSubscriptionUseCase,
    PrismaCustomerRepository,
    SupabaseCustomerRepository,
    PrismaPlanRepository,
    SupabasePlanRepository,
    PrismaSubscriptionRepository,
    SupabaseSubscriptionRepository,
    PrismaInvoiceRepository,
    SupabaseInvoiceRepository,
    PrismaPaymentRepository,
    SupabasePaymentRepository,
    PrismaBalanceRepository,
    SupabaseBalanceRepository,
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (
        config: ConfigService<AppConfig>,
        prismaRepo: PrismaCustomerRepository,
        supabaseRepo: SupabaseCustomerRepository,
      ) => {
        const provider =
          config.get<'supabase' | 'prisma'>('dataProvider') ?? 'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaCustomerRepository,
        SupabaseCustomerRepository,
      ],
    },
    {
      provide: PLAN_REPOSITORY,
      useFactory: (
        config: ConfigService<AppConfig>,
        prismaRepo: PrismaPlanRepository,
        supabaseRepo: SupabasePlanRepository,
      ) => {
        const provider =
          config.get<'supabase' | 'prisma'>('dataProvider') ?? 'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [ConfigService, PrismaPlanRepository, SupabasePlanRepository],
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useFactory: (
        config: ConfigService<AppConfig>,
        prismaRepo: PrismaSubscriptionRepository,
        supabaseRepo: SupabaseSubscriptionRepository,
      ) => {
        const provider =
          config.get<'supabase' | 'prisma'>('dataProvider') ?? 'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaSubscriptionRepository,
        SupabaseSubscriptionRepository,
      ],
    },
    {
      provide: INVOICE_REPOSITORY,
      useFactory: (
        config: ConfigService<AppConfig>,
        prismaRepo: PrismaInvoiceRepository,
        supabaseRepo: SupabaseInvoiceRepository,
      ) => {
        const provider =
          config.get<'supabase' | 'prisma'>('dataProvider') ?? 'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaInvoiceRepository,
        SupabaseInvoiceRepository,
      ],
    },
    {
      provide: PAYMENT_REPOSITORY,
      useFactory: (
        config: ConfigService<AppConfig>,
        prismaRepo: PrismaPaymentRepository,
        supabaseRepo: SupabasePaymentRepository,
      ) => {
        const provider =
          config.get<'supabase' | 'prisma'>('dataProvider') ?? 'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaPaymentRepository,
        SupabasePaymentRepository,
      ],
    },
    {
      provide: BALANCE_REPOSITORY,
      useFactory: (
        config: ConfigService<AppConfig>,
        prismaRepo: PrismaBalanceRepository,
        supabaseRepo: SupabaseBalanceRepository,
      ) => {
        const provider =
          config.get<'supabase' | 'prisma'>('dataProvider') ?? 'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaBalanceRepository,
        SupabaseBalanceRepository,
      ],
    },
  ],
  exports: [CreateSubscriptionUseCase, CancelSubscriptionUseCase],
})
export class BillingModule {}

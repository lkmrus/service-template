import { Module } from '@nestjs/common';
import { BillingController } from './presentation/billing/billing.controller';
import { StripeAdapter } from './infrastructure/payment/stripe.adapter';
import { PAYMENT_GATEWAY_TOKEN } from './infrastructure/payment/payment-gateway.interface';
import { UserCreatedListener } from './application/listeners/user-created.listener';
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

@Module({
  imports: [TransactionsModule],
  controllers: [BillingController],
  providers: [
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      useClass: StripeAdapter,
    },
    UserCreatedListener,
    CreateSubscriptionUseCase,
    CancelSubscriptionUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: PLAN_REPOSITORY, useClass: PrismaPlanRepository },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    { provide: INVOICE_REPOSITORY, useClass: PrismaInvoiceRepository },
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    { provide: BALANCE_REPOSITORY, useClass: PrismaBalanceRepository },
  ],
})
export class BillingModule {}

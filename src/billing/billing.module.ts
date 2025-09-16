import { Module } from '@nestjs/common';
import { BillingController } from './presentation/billing/billing.controller';
import { StripeAdapter } from './infrastructure/payment/stripe.adapter';
import { PAYMENT_GATEWAY_TOKEN } from './infrastructure/payment/payment-gateway.interface';
import { UserCreatedListener } from './application/listeners/user-created.listener';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { TransactionsModule } from '../transactions/transactions.module';
import { TransactionsService } from '../transactions/application/transactions/transactions.service';

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
    TransactionsService,
  ],
})
export class BillingModule {}

import { Module } from '@nestjs/common';
import { TransactionsService } from './application/transactions/transactions.service';
import { TransactionsController } from './presentation/transactions/transactions.controller';
import { OrderRejectedListener } from './application/listeners/order-rejected.listener';

@Module({
  providers: [TransactionsService, OrderRejectedListener],
  controllers: [TransactionsController],
})
export class TransactionsModule {}

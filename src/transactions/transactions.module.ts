import { Module } from '@nestjs/common';
import { TransactionsService } from './application/transactions/transactions.service';
import { TransactionsController } from './presentation/transactions/transactions.controller';
import { OrderRejectedListener } from './application/listeners/order-rejected.listener';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository';
import { PrismaTransactionRepository } from './infrastructure/persistence/prisma-transaction.repository';

@Module({
  providers: [
    TransactionsService,
    OrderRejectedListener,
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}

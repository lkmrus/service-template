import { Module } from '@nestjs/common';
import { TransactionsService } from './application/transactions/transactions.service';
import { TransactionsController } from './presentation/transactions/transactions.controller';
import { OrderRejectedListener } from './application/listeners/order-rejected.listener';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository';
import { PrismaTransactionRepository } from './infrastructure/persistence/prisma-transaction.repository';
import { SupabaseTransactionRepository } from './infrastructure/persistence/supabase-transaction.repository';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/config';

@Module({
  providers: [
    TransactionsService,
    OrderRejectedListener,
    PrismaTransactionRepository,
    SupabaseTransactionRepository,
    {
      provide: TRANSACTION_REPOSITORY,
      useFactory: (
        configService: ConfigService<AppConfig>,
        prismaRepo: PrismaTransactionRepository,
        supabaseRepo: SupabaseTransactionRepository,
      ) => {
        const provider =
          configService.get<'supabase' | 'prisma'>('dataProvider') ??
          'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaTransactionRepository,
        SupabaseTransactionRepository,
      ],
    },
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}

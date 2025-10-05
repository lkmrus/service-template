import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionsService } from '../../../transactions/application/transactions/transactions.service';
import {
  BALANCE_REPOSITORY,
  BalanceRepository,
} from '../../domain/repositories/balance.repository';

interface TransactionCompletedEvent {
  transactionId: string;
}

@Injectable()
export class TransactionCompletedBalanceListener {
  constructor(
    private readonly transactionsService: TransactionsService,
    @Inject(BALANCE_REPOSITORY)
    private readonly balanceRepository: BalanceRepository,
  ) {}

  @OnEvent('transaction.completed')
  async handleTransactionCompletedEvent({
    transactionId,
  }: TransactionCompletedEvent): Promise<void> {
    if (!transactionId) {
      return;
    }

    const transaction = await this.transactionsService.findOne(transactionId);

    await this.balanceRepository.upsert(
      transaction.userId,
      transaction.amountIn ?? 0,
      transaction.amountOut ?? 0,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus, PaymentMethod } from '../../domain/enums/transaction.enums';

@Injectable()
export class TransactionsService {
  // private readonly transactionRepository: ITransactionRepository;
  // private readonly balanceRepository: IBalanceRepository;

  /**
   * Creates a new transaction and updates the user's balance.
   * @param data - The data for the new transaction.
   * @returns The created transaction.
   */
  async createTransaction(data: {
    userId: string;
    serviceAccountId: string;
    amountIn?: number;
    amountOut?: number;
    currency: string;
    status: TransactionStatus;
    paymentMethod: PaymentMethod;
    externalId?: string;
  }): Promise<Transaction> {
    // 1. Create the transaction
    const transaction = { ...data, amountIn: data.amountIn || 0, amountOut: data.amountOut || 0 } as Transaction;
    // const createdTransaction = await this.transactionRepository.create(transaction);

    // 2. Update the user's balance atomically
    // await this.balanceRepository.updateBalance(
    //   data.userId,
    //   data.amountIn || 0,
    //   data.amountOut || 0,
    // );

    return transaction;
  }

  /**
   * Finds a transaction by its ID.
   * @param id - The ID of the transaction to find.
   * @returns The found transaction.
   */
  async findOne(id: string): Promise<Transaction> {
    return { id } as Transaction;
  }

  /**
   * Updates a transaction.
   * @param id - The ID of the transaction to update.
   * @param transaction - The updated transaction data.
   * @returns The updated transaction.
   */
  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    return transaction as Transaction;
  }
}

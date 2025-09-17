import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  TransactionStatus,
  PaymentMethod,
} from '../../domain/enums/transaction.enums';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../../domain/repositories/transaction.repository';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

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
    const transaction = await this.transactionRepository.create({
      userId: data.userId,
      serviceAccountId: data.serviceAccountId,
      amountIn: data.amountIn,
      amountOut: data.amountOut,
      currency: data.currency,
      status: data.status,
      paymentMethod: data.paymentMethod,
      externalId: data.externalId ?? null,
    });

    // Balance updates would happen here in a future implementation

    return transaction;
  }

  /**
   * Finds a transaction by its ID.
   * @param id - The ID of the transaction to find.
   * @returns The found transaction.
   */
  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  /**
   * Updates a transaction.
   * @param id - The ID of the transaction to update.
   * @param transaction - The updated transaction data.
   * @returns The updated transaction.
   */
  async update(
    id: string,
    transaction: Partial<Transaction>,
  ): Promise<Transaction> {
    const existing = await this.findOne(id);

    if (transaction.amountIn !== undefined) {
      existing.amountIn = transaction.amountIn;
    }
    if (transaction.amountOut !== undefined) {
      existing.amountOut = transaction.amountOut;
    }
    if (transaction.currency) {
      existing.currency = transaction.currency;
    }
    if (transaction.status) {
      existing.status = transaction.status;
    }
    if (transaction.paymentMethod) {
      existing.paymentMethod = transaction.paymentMethod;
    }
    if (transaction.externalId !== undefined) {
      existing.externalId = transaction.externalId;
    }
    existing.updatedAt = new Date();

    return this.transactionRepository.save(existing);
  }
}

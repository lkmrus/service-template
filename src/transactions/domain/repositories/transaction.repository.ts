import { Transaction } from '../entities/transaction.entity';
import { PaymentMethod, TransactionStatus } from '../enums/transaction.enums';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface CreateTransactionRecord {
  id?: string;
  userId: string;
  serviceAccountId: string;
  amountIn?: number;
  amountOut?: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  externalId?: string | null;
}

export interface TransactionRepository {
  create(data: CreateTransactionRecord): Promise<Transaction>;
  findById(id: string): Promise<Transaction | undefined>;
  save(transaction: Transaction): Promise<Transaction>;
}

import { TransactionStatus, PaymentMethod } from '../enums/transaction.enums';

export class Transaction {
  id: string;
  userId: string;
  serviceAccountId: string;
  amountIn: number;
  amountOut: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

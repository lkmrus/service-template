import { Payment } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface CreatePaymentRecord {
  paymentId?: string;
  invoiceId: string;
  amount: number;
  createdAt?: Date;
}

export interface PaymentRepository {
  create(data: CreatePaymentRecord): Promise<Payment>;
  listByInvoice(invoiceId: string): Promise<Payment[]>;
}

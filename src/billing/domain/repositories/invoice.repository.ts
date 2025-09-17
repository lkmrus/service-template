import { Invoice } from '../entities/invoice.entity';

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

export interface CreateInvoiceRecord {
  invoiceId?: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
  pdfUrl?: string;
  createdAt?: Date;
}

export interface InvoiceRepository {
  create(data: CreateInvoiceRecord): Promise<Invoice>;
  findById(invoiceId: string): Promise<Invoice | undefined>;
  update(invoice: Invoice): Promise<Invoice>;
}

export class Invoice {
  invoiceId: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
  createdAt: Date;
  pdfUrl?: string;
}

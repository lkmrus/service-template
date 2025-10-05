import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class HandleInvoicePaymentSucceededUseCase {
  private readonly logger = new Logger(
    HandleInvoicePaymentSucceededUseCase.name,
  );

  execute(event: Stripe.InvoicePaymentSucceededEvent): void {
    const invoice = event.data.object;
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : (invoice.customer?.id ?? 'unknown');
    this.logger.debug(
      `Invoice ${invoice.id} payment succeeded for customer ${customerId}`,
    );
  }
}

import { PaymentGateway } from './payment-gateway.interface';

export class StripeAdapter implements PaymentGateway {
  createCustomer(email: string, name: string): Promise<{ customerId: string }> {
    throw new Error('Method not implemented.');
  }
  createSubscription(
    customerId: string,
    planId: string,
  ): Promise<{ subscriptionId: string; status: string }> {
    throw new Error('Method not implemented.');
  }
  cancelSubscription(subscriptionId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

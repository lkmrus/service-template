export interface PaymentGateway {
  createCustomer(email: string, name: string): Promise<{ customerId: string }>;
  createSubscription(
    customerId: string,
    planId: string,
  ): Promise<{ subscriptionId: string; status: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export const PAYMENT_GATEWAY_TOKEN = 'PAYMENT_GATEWAY';

export class Subscription {
  subscriptionId: string;
  customerId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  startDate: Date;
  endDate: Date;
  nextPaymentDate: Date;
}

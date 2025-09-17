import { Subscription } from '../entities/subscription.entity';

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface CreateSubscriptionRecord {
  subscriptionId?: string;
  customerId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  startDate: Date;
  endDate?: Date | null;
  nextPaymentDate?: Date | null;
}

export interface SubscriptionRepository {
  create(data: CreateSubscriptionRecord): Promise<Subscription>;
  findById(subscriptionId: string): Promise<Subscription | undefined>;
  update(subscription: Subscription): Promise<Subscription>;
}

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class StripeAdapter implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    if (!apiKey) {
      throw new Error('STRIPE_API_KEY is not configured');
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
    });
  }

  async createCustomer(
    email: string,
    name: string,
  ): Promise<{ customerId: string }> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return { customerId: customer.id };
  }

  async createSubscription(
    customerId: string,
    planId: string,
  ): Promise<{ subscriptionId: string; status: string }> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }
}

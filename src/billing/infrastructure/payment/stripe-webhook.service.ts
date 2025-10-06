import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { AppConfig } from '../../../config/config';

@Injectable()
export class StripeWebhookService {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  constructEvent(payload: Buffer | string, signature: string): Stripe.Event {
    const secret = this.configService.get<string>('stripeWebhookSecret');
    if (!secret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    return Stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

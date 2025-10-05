import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class HandleCustomerSubscriptionUpdatedUseCase {
  private readonly logger = new Logger(
    HandleCustomerSubscriptionUpdatedUseCase.name,
  );

  execute(event: Stripe.CustomerSubscriptionUpdatedEvent): void {
    const subscription = event.data.object;
    this.logger.debug(
      `Subscription ${subscription.id} updated with status ${subscription.status}`,
    );
  }
}

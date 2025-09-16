import { Controller, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { Request } from 'express';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
  ) {}

  /**
   * Creates a new subscription.
   * @param body - The request body containing the userId, planId and preOrderId.
   * @returns The result of the use case execution.
   */
  @Post('subscriptions')
  createSubscription(
    @Body() body: { userId: string; planId: string; preOrderId: string },
  ) {
    return this.createSubscriptionUseCase.execute(
      body.userId,
      body.planId,
      body.preOrderId,
    );
  }

  /**
   * Cancels a subscription.
   * @param id - The ID of the subscription to cancel.
   * @returns The result of the use case execution.
   */
  @Delete('subscriptions/:id')
  cancelSubscription(@Param('id') id: string) {
    return this.cancelSubscriptionUseCase.execute(id);
  }

  /**
   * Handles incoming webhooks from Stripe.
   * @param req - The incoming request.
   * @returns An object indicating that the webhook was received.
   */
  @Post('webhooks/stripe')
  handleStripeWebhook(@Req() req: Request) {
    console.log('Stripe webhook received:', req.body);
    return { received: true };
  }
}

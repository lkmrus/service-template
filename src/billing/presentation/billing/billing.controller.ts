import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { Request } from 'express';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import Stripe from 'stripe';
import { StripeWebhookService } from '../../infrastructure/payment/stripe-webhook.service';
import { HandleInvoicePaymentSucceededUseCase } from '../../application/use-cases/handle-invoice-payment-succeeded.use-case';
import { HandleCustomerSubscriptionUpdatedUseCase } from '../../application/use-cases/handle-customer-subscription-updated.use-case';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly stripeWebhookService: StripeWebhookService,
    private readonly handleInvoicePaymentSucceededUseCase: HandleInvoicePaymentSucceededUseCase,
    private readonly handleCustomerSubscriptionUpdatedUseCase: HandleCustomerSubscriptionUpdatedUseCase,
  ) {}

  /**
   * Creates a new subscription.
   * @param body - The request body containing the userId, planId and preOrderId.
   * @returns The result of the use case execution.
   */
  @Post('subscriptions')
  createSubscription(@Body() body: CreateSubscriptionDto) {
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
  async handleStripeWebhook(@Req() req: Request) {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new BadRequestException('Stripe signature header is missing');
    }

    const payload =
      (req as Request & { rawBody?: Buffer | string }).rawBody ??
      (Buffer.isBuffer(req.body)
        ? req.body
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {}));

    let event: Stripe.Event;
    try {
      event = this.stripeWebhookService.constructEvent(
        payload,
        Array.isArray(signature) ? signature[0] : signature,
      );
    } catch (error) {
      this.logger.error('Failed to validate Stripe webhook signature', error);
      throw new BadRequestException('Invalid Stripe signature');
    }

    await this.dispatchStripeEvent(event);

    return { received: true };
  }

  private async dispatchStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        if (this.isInvoicePaymentSucceededEvent(event)) {
          await Promise.resolve(
            this.handleInvoicePaymentSucceededUseCase.execute(event),
          );
        }
        break;
      case 'customer.subscription.updated':
        if (this.isCustomerSubscriptionUpdatedEvent(event)) {
          await Promise.resolve(
            this.handleCustomerSubscriptionUpdatedUseCase.execute(event),
          );
        }
        break;
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private isInvoicePaymentSucceededEvent(
    event: Stripe.Event,
  ): event is Stripe.InvoicePaymentSucceededEvent {
    return event.type === 'invoice.payment_succeeded';
  }

  private isCustomerSubscriptionUpdatedEvent(
    event: Stripe.Event,
  ): event is Stripe.CustomerSubscriptionUpdatedEvent {
    return event.type === 'customer.subscription.updated';
  }
}

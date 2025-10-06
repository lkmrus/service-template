import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Stripe from 'stripe';
import type { Request } from 'express';
import { BillingController } from './billing.controller';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { StripeWebhookService } from '../../infrastructure/payment/stripe-webhook.service';
import { HandleInvoicePaymentSucceededUseCase } from '../../application/use-cases/handle-invoice-payment-succeeded.use-case';
import { HandleCustomerSubscriptionUpdatedUseCase } from '../../application/use-cases/handle-customer-subscription-updated.use-case';

describe('BillingController - Stripe webhooks', () => {
  let controller: BillingController;
  const webhookSecret = 'whsec_test_secret';

  const createSubscriptionUseCase = {
    execute: jest.fn(),
  };
  const cancelSubscriptionUseCase = {
    execute: jest.fn(),
  };
  const handleInvoicePaymentSucceededUseCase = {
    execute: jest.fn(),
  };
  const handleCustomerSubscriptionUpdatedUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: CreateSubscriptionUseCase,
          useValue: createSubscriptionUseCase,
        },
        {
          provide: CancelSubscriptionUseCase,
          useValue: cancelSubscriptionUseCase,
        },
        {
          provide: HandleInvoicePaymentSucceededUseCase,
          useValue: handleInvoicePaymentSucceededUseCase,
        },
        {
          provide: HandleCustomerSubscriptionUpdatedUseCase,
          useValue: handleCustomerSubscriptionUpdatedUseCase,
        },
        StripeWebhookService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'stripeWebhookSecret') {
                return webhookSecret;
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    jest.clearAllMocks();
  });

  const buildRequest = (
    payload: Record<string, unknown>,
    signature: string,
  ): Request => {
    return {
      headers: {
        'stripe-signature': signature,
      },
      rawBody: Buffer.from(JSON.stringify(payload)),
      body: payload,
    } as unknown as Request;
  };

  it('acknowledges invoice payment succeeded events', async () => {
    const eventPayload = {
      id: 'evt_1',
      object: 'event',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_1',
          object: 'invoice',
          customer: 'cus_123',
        },
      },
    };
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(eventPayload),
      secret: webhookSecret,
    });

    const response = await controller.handleStripeWebhook(
      buildRequest(eventPayload, signature),
    );

    expect(response).toEqual({ received: true });
    expect(handleInvoicePaymentSucceededUseCase.execute).toHaveBeenCalledTimes(
      1,
    );
    expect(
      handleCustomerSubscriptionUpdatedUseCase.execute,
    ).not.toHaveBeenCalled();
  });

  it('acknowledges customer subscription updated events', async () => {
    const eventPayload = {
      id: 'evt_2',
      object: 'event',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          object: 'subscription',
          status: 'active',
        },
      },
    };
    const signature = Stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(eventPayload),
      secret: webhookSecret,
    });

    const response = await controller.handleStripeWebhook(
      buildRequest(eventPayload, signature),
    );

    expect(response).toEqual({ received: true });
    expect(
      handleCustomerSubscriptionUpdatedUseCase.execute,
    ).toHaveBeenCalledTimes(1);
    expect(handleInvoicePaymentSucceededUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects requests without signature header', async () => {
    await expect(
      controller.handleStripeWebhook({ headers: {} } as unknown as Request),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects requests with invalid signature', async () => {
    const eventPayload = {
      id: 'evt_3',
      object: 'event',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_2',
          object: 'invoice',
          customer: 'cus_321',
        },
      },
    };

    await expect(
      controller.handleStripeWebhook(buildRequest(eventPayload, 'invalid')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

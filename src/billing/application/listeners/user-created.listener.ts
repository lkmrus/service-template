import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/repositories/customer.repository';
import {
  PAYMENT_GATEWAY_TOKEN,
  PaymentGateway,
} from '../../infrastructure/payment/payment-gateway.interface';

interface UserCreatedEventPayload {
  userId: string;
  email: string;
  name: string;
}

@Injectable()
export class UserCreatedListener {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: UserCreatedEventPayload) {
    const existingCustomer = await this.customerRepository.findByUserId(
      payload.userId,
    );

    if (existingCustomer) {
      return;
    }

    const { customerId } = await this.paymentGateway.createCustomer(
      payload.email,
      payload.name,
    );

    await this.customerRepository.create({
      customerId,
      userId: payload.userId,
    });
  }
}

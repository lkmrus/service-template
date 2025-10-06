import { UserCreatedListener } from './user-created.listener';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { PaymentGateway } from '../../infrastructure/payment/payment-gateway.interface';

describe('UserCreatedListener', () => {
  const buildMocks = () => {
    const customerRepository: jest.Mocked<CustomerRepository> = {
      findByUserId: jest.fn(),
      findByCustomerId: jest.fn(),
      create: jest.fn(),
    };
    const paymentGateway: jest.Mocked<PaymentGateway> = {
      createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
    };
    return { customerRepository, paymentGateway };
  };

  const payload = {
    userId: 'user-1',
    email: 'user@example.com',
    name: 'User Name',
  };

  it('creates a customer when one does not exist', async () => {
    const { customerRepository, paymentGateway } = buildMocks();
    const listener = new UserCreatedListener(
      customerRepository,
      paymentGateway,
    );

    customerRepository.findByUserId.mockResolvedValue(undefined);
    paymentGateway.createCustomer.mockResolvedValue({ customerId: 'cus_1' });
    const createdCustomer = new Customer();
    createdCustomer.userId = payload.userId;
    createdCustomer.customerId = 'cus_1';
    customerRepository.create.mockResolvedValue(createdCustomer);

    await listener.handleUserCreatedEvent(payload);

    const createCustomerMock =
      paymentGateway.createCustomer as jest.MockedFunction<
        PaymentGateway['createCustomer']
      >;
    expect(createCustomerMock).toHaveBeenCalledWith(
      payload.email,
      payload.name,
    );
    const repositoryCreateMock =
      customerRepository.create as jest.MockedFunction<
        CustomerRepository['create']
      >;
    expect(repositoryCreateMock).toHaveBeenCalledWith({
      userId: payload.userId,
      customerId: 'cus_1',
    });
  });

  it('does not create a customer when one already exists', async () => {
    const { customerRepository, paymentGateway } = buildMocks();
    const listener = new UserCreatedListener(
      customerRepository,
      paymentGateway,
    );

    const existingCustomer = new Customer();
    existingCustomer.userId = payload.userId;
    existingCustomer.customerId = 'cus_existing';
    customerRepository.findByUserId.mockResolvedValue(existingCustomer);

    await listener.handleUserCreatedEvent(payload);

    const createCustomerMock =
      paymentGateway.createCustomer as jest.MockedFunction<
        PaymentGateway['createCustomer']
      >;
    expect(createCustomerMock).not.toHaveBeenCalled();
    const repositoryCreateMock =
      customerRepository.create as jest.MockedFunction<
        CustomerRepository['create']
      >;
    expect(repositoryCreateMock).not.toHaveBeenCalled();
  });
});

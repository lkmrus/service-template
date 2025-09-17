import { Customer } from '../entities/customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CreateCustomerRecord {
  customerId: string;
  userId: string;
}

export interface CustomerRepository {
  findByUserId(userId: string): Promise<Customer | undefined>;
  findByCustomerId(customerId: string): Promise<Customer | undefined>;
  create(data: CreateCustomerRecord): Promise<Customer>;
}

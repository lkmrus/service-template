import { Injectable } from '@nestjs/common';
import { Customer as PrismaCustomer } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Customer } from '../../domain/entities/customer.entity';
import {
  CreateCustomerRecord,
  CustomerRepository,
} from '../../domain/repositories/customer.repository';

const mapToDomain = (record: PrismaCustomer | null): Customer | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Customer();
  entity.userId = record.userId;
  entity.customerId = record.customerId;
  return entity;
};

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Customer | undefined> {
    const record = await this.prisma.customer.findUnique({ where: { userId } });
    return mapToDomain(record);
  }

  async findByCustomerId(customerId: string): Promise<Customer | undefined> {
    const record = await this.prisma.customer.findUnique({
      where: { customerId },
    });
    return mapToDomain(record);
  }

  async create(data: CreateCustomerRecord): Promise<Customer> {
    const record = await this.prisma.customer.create({ data });
    return mapToDomain(record)!;
  }
}

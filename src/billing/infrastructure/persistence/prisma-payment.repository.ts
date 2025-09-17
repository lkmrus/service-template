import { Injectable } from '@nestjs/common';
import { Payment as PrismaPayment } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Payment } from '../../domain/entities/payment.entity';
import {
  CreatePaymentRecord,
  PaymentRepository,
} from '../../domain/repositories/payment.repository';

const mapToDomain = (record: PrismaPayment | null): Payment | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Payment();
  entity.paymentId = record.paymentId;
  entity.invoiceId = record.invoiceId;
  entity.amount = record.amount;
  entity.createdAt = record.createdAt;
  return entity;
};

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentRecord): Promise<Payment> {
    const record = await this.prisma.payment.create({
      data: {
        paymentId: data.paymentId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        createdAt: data.createdAt ?? undefined,
      },
    });
    return mapToDomain(record)!;
  }

  async listByInvoice(invoiceId: string): Promise<Payment[]> {
    const records = await this.prisma.payment.findMany({
      where: { invoiceId },
    });
    return records.map((record) => mapToDomain(record)!);
  }
}

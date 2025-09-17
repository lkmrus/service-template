import { Injectable } from '@nestjs/common';
import { Transaction as PrismaTransaction } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  CreateTransactionRecord,
  TransactionRepository,
} from '../../domain/repositories/transaction.repository';
import {
  PaymentMethod,
  TransactionStatus,
} from '../../domain/enums/transaction.enums';

const mapToDomain = (
  record: PrismaTransaction | null,
): Transaction | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Transaction();
  entity.id = record.id;
  entity.userId = record.userId;
  entity.serviceAccountId = record.serviceAccountId;
  entity.amountIn = record.amountIn;
  entity.amountOut = record.amountOut;
  entity.currency = record.currency;
  entity.status = record.status as TransactionStatus;
  entity.paymentMethod = record.paymentMethod as PaymentMethod;
  entity.externalId = record.externalId ?? undefined;
  entity.createdAt = record.createdAt;
  entity.updatedAt = record.updatedAt;
  return entity;
};

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionRecord): Promise<Transaction> {
    const record = await this.prisma.transaction.create({
      data: {
        id: data.id,
        userId: data.userId,
        serviceAccountId: data.serviceAccountId,
        amountIn: data.amountIn ?? 0,
        amountOut: data.amountOut ?? 0,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.paymentMethod,
        externalId: data.externalId ?? null,
      },
    });
    return mapToDomain(record)!;
  }

  async findById(id: string): Promise<Transaction | undefined> {
    const record = await this.prisma.transaction.findUnique({ where: { id } });
    return mapToDomain(record);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const record = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        userId: transaction.userId,
        serviceAccountId: transaction.serviceAccountId,
        amountIn: transaction.amountIn,
        amountOut: transaction.amountOut,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        externalId: transaction.externalId ?? null,
        updatedAt: transaction.updatedAt,
      },
    });
    return mapToDomain(record)!;
  }
}

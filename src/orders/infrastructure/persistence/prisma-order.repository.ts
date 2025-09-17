import { Injectable } from '@nestjs/common';
import { Order as PrismaOrder, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Order } from '../../domain/entities/order.entity';
import {
  CreateOrderRecord,
  OrderRepository,
} from '../../domain/repositories/order.repository';
import { OrderStatus } from '../../domain/enums/order.enums';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../../domain/types/commission.types';

const mapToDomain = (record: PrismaOrder | null): Order | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Order();
  entity.id = record.id;
  entity.preOrderId = record.preOrderId ?? undefined;
  entity.transactionId = record.transactionId ?? undefined;
  entity.userId = record.userId;
  entity.sellerId = record.sellerId;
  entity.productId = record.productId;
  entity.quantity = record.quantity;
  entity.totalPrice = record.totalPrice;
  entity.currency = record.currency;
  entity.commissions = record.commissions as unknown as CommissionMatrix;
  entity.calculatedCommissions = record.calculatedCommissions as unknown as
    | CalculatedCommission
    | undefined;
  entity.status = record.status as OrderStatus;
  entity.createdAt = record.createdAt;
  entity.updatedAt = record.updatedAt;
  return entity;
};

const toJsonValue = (value: CommissionMatrix): Prisma.InputJsonValue =>
  value as unknown as Prisma.InputJsonValue;

const toNullableJson = (
  value: CalculatedCommission | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.JsonNull;
  }
  return value as unknown as Prisma.InputJsonValue;
};

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderRecord): Promise<Order> {
    const record = await this.prisma.order.create({
      data: {
        id: data.id,
        preOrderId: data.preOrderId ?? null,
        transactionId: data.transactionId ?? null,
        userId: data.userId,
        sellerId: data.sellerId,
        productId: data.productId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        currency: data.currency,
        commissions: toJsonValue(data.commissions),
        calculatedCommissions: toNullableJson(
          data.calculatedCommissions ?? undefined,
        ),
        status: data.status ?? OrderStatus.PAID,
      },
    });
    return mapToDomain(record)!;
  }

  async findById(id: string): Promise<Order | undefined> {
    const record = await this.prisma.order.findUnique({ where: { id } });
    return mapToDomain(record);
  }

  async save(order: Order): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        preOrderId: order.preOrderId || null,
        transactionId: order.transactionId || null,
        userId: order.userId,
        sellerId: order.sellerId,
        productId: order.productId,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        currency: order.currency,
        commissions: toJsonValue(order.commissions),
        calculatedCommissions: toNullableJson(
          order.calculatedCommissions ?? undefined,
        ),
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
    return mapToDomain(record)!;
  }
}

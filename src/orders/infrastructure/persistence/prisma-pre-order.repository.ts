import { Injectable } from '@nestjs/common';
import { Prisma, PreOrder as PrismaPreOrder } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PreOrder } from '../../domain/entities/pre-order.entity';
import {
  CreatePreOrderRecord,
  PreOrderRepository,
} from '../../domain/repositories/pre-order.repository';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../../domain/types/commission.types';

const mapToDomain = (record: PrismaPreOrder | null): PreOrder | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new PreOrder();
  entity.id = record.id;
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
export class PrismaPreOrderRepository implements PreOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePreOrderRecord): Promise<PreOrder> {
    const record = await this.prisma.preOrder.create({
      data: {
        id: data.id,
        userId: data.userId,
        sellerId: data.sellerId,
        productId: data.productId,
        quantity: data.quantity,
        totalPrice: data.totalPrice ?? 0,
        currency: data.currency,
        commissions: toJsonValue(data.commissions),
        calculatedCommissions: toNullableJson(
          data.calculatedCommissions ?? undefined,
        ),
      },
    });
    return mapToDomain(record)!;
  }

  async findById(id: string): Promise<PreOrder | undefined> {
    const record = await this.prisma.preOrder.findUnique({ where: { id } });
    return mapToDomain(record);
  }

  async save(preOrder: PreOrder): Promise<PreOrder> {
    const record = await this.prisma.preOrder.update({
      where: { id: preOrder.id },
      data: {
        userId: preOrder.userId,
        sellerId: preOrder.sellerId,
        productId: preOrder.productId,
        quantity: preOrder.quantity,
        totalPrice: preOrder.totalPrice,
        currency: preOrder.currency,
        commissions: toJsonValue(preOrder.commissions),
        calculatedCommissions: toNullableJson(
          preOrder.calculatedCommissions ?? undefined,
        ),
        updatedAt: preOrder.updatedAt,
      },
    });
    return mapToDomain(record)!;
  }
}

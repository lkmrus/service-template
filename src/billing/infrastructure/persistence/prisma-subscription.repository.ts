import { Injectable } from '@nestjs/common';
import { Subscription as PrismaSubscription } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Subscription } from '../../domain/entities/subscription.entity';
import {
  CreateSubscriptionRecord,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository';

const mapToDomain = (
  record: PrismaSubscription | null,
): Subscription | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Subscription();
  entity.subscriptionId = record.subscriptionId;
  entity.customerId = record.customerId;
  entity.planId = record.planId;
  entity.status = record.status;
  entity.startDate = record.startDate;
  entity.endDate = record.endDate ?? undefined;
  entity.nextPaymentDate = record.nextPaymentDate ?? undefined;
  return entity;
};

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSubscriptionRecord): Promise<Subscription> {
    const record = await this.prisma.subscription.create({
      data: {
        subscriptionId: data.subscriptionId,
        customerId: data.customerId,
        planId: data.planId,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        nextPaymentDate: data.nextPaymentDate ?? null,
      },
    });
    return mapToDomain(record)!;
  }

  async findById(subscriptionId: string): Promise<Subscription | undefined> {
    const record = await this.prisma.subscription.findUnique({
      where: { subscriptionId },
    });
    return mapToDomain(record);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const record = await this.prisma.subscription.update({
      where: { subscriptionId: subscription.subscriptionId },
      data: {
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate ?? null,
        nextPaymentDate: subscription.nextPaymentDate ?? null,
      },
    });
    return mapToDomain(record)!;
  }
}

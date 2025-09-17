import { Injectable } from '@nestjs/common';
import { Plan as PrismaPlan } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Plan } from '../../domain/entities/plan.entity';
import {
  CreatePlanRecord,
  PlanRepository,
} from '../../domain/repositories/plan.repository';

const mapToDomain = (record: PrismaPlan | null): Plan | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Plan();
  entity.planId = record.planId;
  entity.name = record.name;
  entity.description = record.description ?? undefined;
  entity.price = record.price;
  entity.currency = record.currency;
  entity.interval = record.interval;
  return entity;
};

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(planId: string): Promise<Plan | undefined> {
    const record = await this.prisma.plan.findUnique({ where: { planId } });
    return mapToDomain(record);
  }

  async create(data: CreatePlanRecord): Promise<Plan> {
    const record = await this.prisma.plan.create({
      data: {
        planId: data.planId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        interval: data.interval,
      },
    });
    return mapToDomain(record)!;
  }

  async list(): Promise<Plan[]> {
    const records = await this.prisma.plan.findMany();
    return records.map((record) => mapToDomain(record)!);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Review } from '../../domain/entities/review.entity';
import {
  CreateReviewRecord,
  ReviewRepository,
  UpdateReviewRecord,
} from '../../domain/repositories/review.repository';

const mapToDomain = (record: any | null): Review | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Review();
  entity.id = record.id;
  entity.productId = record.productId;
  entity.userId = record.userId;
  entity.review = record.review;
  entity.orderId = record.orderId ?? undefined;
  entity.rate = record.rate;
  entity.lang = record.lang;
  entity.date = record.date;
  entity.createdAt = record.createdAt;
  entity.updatedAt = record.updatedAt;
  return entity;
};

@Injectable()
export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Review[]> {
    const records = await this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => mapToDomain(record)!);
  }

  async listByProduct(productId: string): Promise<Review[]> {
    const records = await this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => mapToDomain(record)!);
  }

  async findById(id: string): Promise<Review | undefined> {
    const record = await this.prisma.review.findUnique({ where: { id } });
    return mapToDomain(record);
  }

  async create(data: CreateReviewRecord): Promise<Review> {
    const record = await this.prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        review: data.review,
        orderId: data.orderId ?? null,
        rate: data.rate,
        lang: data.lang,
        date: data.date,
      },
    });
    return mapToDomain(record)!;
  }

  async update(id: string, data: UpdateReviewRecord): Promise<Review> {
    const updateData: Record<string, any> = {};

    if (data.productId !== undefined) {
      updateData.productId = data.productId;
    }
    if (data.userId !== undefined) {
      updateData.userId = data.userId;
    }
    if (data.review !== undefined) {
      updateData.review = data.review;
    }
    if (data.orderId !== undefined) {
      updateData.orderId = data.orderId;
    }
    if (data.rate !== undefined) {
      updateData.rate = data.rate;
    }
    if (data.lang !== undefined) {
      updateData.lang = data.lang;
    }
    if (data.date !== undefined) {
      updateData.date = data.date;
    }

    const record = await this.prisma.review.update({
      where: { id },
      data: updateData,
    });
    return mapToDomain(record)!;
  }

  async delete(id: string): Promise<Review> {
    const record = await this.prisma.review.delete({ where: { id } });
    return mapToDomain(record)!;
  }
}

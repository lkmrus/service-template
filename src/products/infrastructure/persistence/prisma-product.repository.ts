import { Injectable } from '@nestjs/common';
import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Product } from '../../domain/entities/product.entity';
import {
  CreateProductRecord,
  ProductRepository,
  UpdateProductRecord,
} from '../../domain/repositories/product.repository';
import { ProductPrices } from '../../domain/types/product-prices.type';

const mapToDomain = (record: PrismaProduct | null): Product | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Product();
  entity.id = record.id;
  entity.title = record.title;
  entity.slug = record.slug;
  entity.sku = record.sku ?? undefined;
  entity.description = record.description ?? undefined;
  entity.properties = record.properties as Record<string, any>;
  entity.prices = record.prices as ProductPrices;
  entity.quantity = record.quantity;
  entity.isActive = record.isActive;
  entity.metadata =
    record.metadata === null
      ? undefined
      : (record.metadata as Record<string, any> | undefined);
  entity.createdAt = record.createdAt;
  entity.updatedAt = record.updatedAt;
  return entity;
};

const toJsonValue = (value: Record<string, any>): Prisma.InputJsonValue =>
  value as unknown as Prisma.InputJsonValue;

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => mapToDomain(record)!);
  }

  async findById(id: string): Promise<Product | undefined> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return mapToDomain(record);
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const record = await this.prisma.product.findUnique({ where: { slug } });
    return mapToDomain(record);
  }

  async findBySku(sku: string): Promise<Product | undefined> {
    const record = await this.prisma.product.findUnique({ where: { sku } });
    return mapToDomain(record);
  }

  async create(data: CreateProductRecord): Promise<Product> {
    const record = await this.prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        sku: data.sku ?? null,
        description: data.description ?? null,
        properties: toJsonValue(data.properties),
        prices: toJsonValue(data.prices),
        quantity: data.quantity,
        isActive: data.isActive,
        metadata:
          data.metadata === undefined ? undefined : toJsonValue(data.metadata),
      },
    });
    return mapToDomain(record)!;
  }

  async update(id: string, data: UpdateProductRecord): Promise<Product> {
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }
    if (data.sku !== undefined) {
      updateData.sku = data.sku;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.properties !== undefined) {
      updateData.properties = toJsonValue(data.properties);
    }
    if (data.prices !== undefined) {
      updateData.prices = toJsonValue(data.prices);
    }
    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = toJsonValue(data.metadata);
    }

    const record = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });
    return mapToDomain(record)!;
  }

  async delete(id: string): Promise<Product> {
    const record = await this.prisma.product.delete({ where: { id } });
    return mapToDomain(record)!;
  }
}

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Product } from '../../domain/entities/product.entity';
import {
  CreateProductRecord,
  ProductRepository,
  UpdateProductRecord,
} from '../../domain/repositories/product.repository';
import { ProductPrices } from '../../domain/types/product-prices.type';

const TABLE = quoted('Product');

const mapToDomain = (record: any): Product | undefined => {
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
  entity.quantity = Number(record.quantity ?? 0);
  entity.isActive = Boolean(record.isActive);
  entity.metadata = record.metadata ?? undefined;
  entity.createdAt = new Date(record.createdAt);
  entity.updatedAt = new Date(record.updatedAt);
  return entity;
};

@Injectable()
export class SupabaseProductRepository implements ProductRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async list(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .order('createdAt', { ascending: false });
    handleSupabaseError(error);
    return (data ?? []).map((record) => mapToDomain(record)!);
  }

  async findById(id: string): Promise<Product | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async findBySku(sku: string): Promise<Product | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('sku', sku)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async create(data: CreateProductRecord): Promise<Product> {
    const { data: created, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        title: data.title,
        slug: data.slug,
        sku: data.sku ?? null,
        description: data.description ?? null,
        properties: data.properties,
        prices: data.prices,
        quantity: data.quantity,
        isActive: data.isActive,
        metadata: data.metadata ?? null,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(created)!;
  }

  async update(id: string, data: UpdateProductRecord): Promise<Product> {
    const payload: Record<string, any> = {};

    if (data.title !== undefined) {
      payload.title = data.title;
    }
    if (data.slug !== undefined) {
      payload.slug = data.slug;
    }
    if (data.sku !== undefined) {
      payload.sku = data.sku;
    }
    if (data.description !== undefined) {
      payload.description = data.description;
    }
    if (data.properties !== undefined) {
      payload.properties = data.properties;
    }
    if (data.prices !== undefined) {
      payload.prices = data.prices;
    }
    if (data.quantity !== undefined) {
      payload.quantity = data.quantity;
    }
    if (data.isActive !== undefined) {
      payload.isActive = data.isActive;
    }
    if (data.metadata !== undefined) {
      payload.metadata = data.metadata;
    }
    payload.updatedAt = new Date().toISOString();

    const { data: updated, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(updated)!;
  }

  async delete(id: string): Promise<Product> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .delete()
      .eq('id', id)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Review } from '../../domain/entities/review.entity';
import {
  CreateReviewRecord,
  ReviewRepository,
  UpdateReviewRecord,
} from '../../domain/repositories/review.repository';

const TABLE = quoted('Review');

const mapToDomain = (record: any): Review | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Review();
  entity.id = record.id;
  entity.productId = record.productId;
  entity.userId = record.userId;
  entity.review = record.review;
  entity.orderId = record.orderId ?? undefined;
  entity.rate = Number(record.rate);
  entity.lang = record.lang;
  entity.date = new Date(record.date);
  entity.createdAt = new Date(record.createdAt);
  entity.updatedAt = new Date(record.updatedAt);
  return entity;
};

@Injectable()
export class SupabaseReviewRepository implements ReviewRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async list(): Promise<Review[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .order('createdAt', { ascending: false });
    handleSupabaseError(error);
    return (data ?? []).map((record) => mapToDomain(record)!);
  }

  async listByProduct(productId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('productId', productId)
      .order('createdAt', { ascending: false });
    handleSupabaseError(error);
    return (data ?? []).map((record) => mapToDomain(record)!);
  }

  async findById(id: string): Promise<Review | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async create(data: CreateReviewRecord): Promise<Review> {
    const { data: created, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        productId: data.productId,
        userId: data.userId,
        review: data.review,
        orderId: data.orderId ?? null,
        rate: data.rate,
        lang: data.lang,
        date: data.date.toISOString(),
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(created)!;
  }

  async update(id: string, data: UpdateReviewRecord): Promise<Review> {
    const payload: Record<string, any> = {};

    if (data.productId !== undefined) {
      payload.productId = data.productId;
    }
    if (data.userId !== undefined) {
      payload.userId = data.userId;
    }
    if (data.review !== undefined) {
      payload.review = data.review;
    }
    if (data.orderId !== undefined) {
      payload.orderId = data.orderId;
    }
    if (data.rate !== undefined) {
      payload.rate = data.rate;
    }
    if (data.lang !== undefined) {
      payload.lang = data.lang;
    }
    if (data.date !== undefined) {
      payload.date = data.date.toISOString();
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

  async delete(id: string): Promise<Review> {
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

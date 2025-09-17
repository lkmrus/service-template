import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Plan } from '../../domain/entities/plan.entity';
import {
  CreatePlanRecord,
  PlanRepository,
} from '../../domain/repositories/plan.repository';

const TABLE = quoted('Plan');

const mapToDomain = (record: any): Plan | undefined => {
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
export class SupabasePlanRepository implements PlanRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findById(planId: string): Promise<Plan | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('planId', planId)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async create(data: CreatePlanRecord): Promise<Plan> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        planId: data.planId,
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        currency: data.currency,
        interval: data.interval,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async list(): Promise<Plan[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*');
    handleSupabaseError(error);
    return (data ?? []).map((record) => mapToDomain(record)!);
  }
}

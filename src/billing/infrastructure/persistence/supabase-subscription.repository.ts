import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Subscription } from '../../domain/entities/subscription.entity';
import {
  CreateSubscriptionRecord,
  SubscriptionRepository,
} from '../../domain/repositories/subscription.repository';

const TABLE = quoted('Subscription');

const mapToDomain = (record: any): Subscription | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Subscription();
  entity.subscriptionId = record.subscriptionId;
  entity.customerId = record.customerId;
  entity.planId = record.planId;
  entity.status = record.status;
  entity.startDate = new Date(record.startDate);
  entity.endDate = record.endDate ? new Date(record.endDate) : undefined;
  entity.nextPaymentDate = record.nextPaymentDate
    ? new Date(record.nextPaymentDate)
    : undefined;
  return entity;
};

@Injectable()
export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: CreateSubscriptionRecord): Promise<Subscription> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        subscriptionId: data.subscriptionId,
        customerId: data.customerId,
        planId: data.planId,
        status: data.status,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate?.toISOString() ?? null,
        nextPaymentDate: data.nextPaymentDate?.toISOString() ?? null,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async findById(subscriptionId: string): Promise<Subscription | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('subscriptionId', subscriptionId)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update({
        customerId: subscription.customerId,
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate?.toISOString() ?? null,
        nextPaymentDate: subscription.nextPaymentDate?.toISOString() ?? null,
      })
      .eq('subscriptionId', subscription.subscriptionId)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}

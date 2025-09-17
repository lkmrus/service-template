import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Customer } from '../../domain/entities/customer.entity';
import {
  CreateCustomerRecord,
  CustomerRepository,
} from '../../domain/repositories/customer.repository';

const TABLE = quoted('Customer');

const mapToDomain = (record: any): Customer | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Customer();
  entity.customerId = record.customerId;
  entity.userId = record.userId;
  return entity;
};

@Injectable()
export class SupabaseCustomerRepository implements CustomerRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findByUserId(userId: string): Promise<Customer | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async findByCustomerId(customerId: string): Promise<Customer | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('customerId', customerId)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async create(data: CreateCustomerRecord): Promise<Customer> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        customerId: data.customerId,
        userId: data.userId,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }
}

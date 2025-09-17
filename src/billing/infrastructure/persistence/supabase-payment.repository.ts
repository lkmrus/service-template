import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Payment } from '../../domain/entities/payment.entity';
import {
  CreatePaymentRecord,
  PaymentRepository,
} from '../../domain/repositories/payment.repository';

const TABLE = quoted('Payment');

const mapToDomain = (record: any): Payment | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Payment();
  entity.paymentId = record.paymentId;
  entity.invoiceId = record.invoiceId;
  entity.amount = record.amount;
  entity.createdAt = new Date(record.createdAt);
  return entity;
};

@Injectable()
export class SupabasePaymentRepository implements PaymentRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: CreatePaymentRecord): Promise<Payment> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        paymentId: data.paymentId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        createdAt: data.createdAt?.toISOString() ?? undefined,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async listByInvoice(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('invoiceId', invoiceId);
    handleSupabaseError(error);
    return (data ?? []).map((record) => mapToDomain(record)!);
  }
}

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Invoice } from '../../domain/entities/invoice.entity';
import {
  CreateInvoiceRecord,
  InvoiceRepository,
} from '../../domain/repositories/invoice.repository';

const TABLE = quoted('Invoice');

const mapToDomain = (record: any): Invoice | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Invoice();
  entity.invoiceId = record.invoiceId;
  entity.subscriptionId = record.subscriptionId;
  entity.amount = record.amount;
  entity.status = record.status;
  entity.createdAt = new Date(record.createdAt);
  entity.pdfUrl = record.pdfUrl ?? undefined;
  return entity;
};

@Injectable()
export class SupabaseInvoiceRepository implements InvoiceRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: CreateInvoiceRecord): Promise<Invoice> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        invoiceId: data.invoiceId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        status: data.status,
        createdAt: data.createdAt?.toISOString() ?? undefined,
        pdfUrl: data.pdfUrl ?? null,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async findById(invoiceId: string): Promise<Invoice | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('invoiceId', invoiceId)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update({
        amount: invoice.amount,
        status: invoice.status,
        pdfUrl: invoice.pdfUrl ?? null,
      })
      .eq('invoiceId', invoice.invoiceId)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}

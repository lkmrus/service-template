import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  CreateTransactionRecord,
  TransactionRepository,
} from '../../domain/repositories/transaction.repository';
import {
  PaymentMethod,
  TransactionStatus,
} from '../../domain/enums/transaction.enums';

const TABLE = quoted('Transaction');

const mapToDomain = (record: any): Transaction | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Transaction();
  entity.id = record.id;
  entity.userId = record.userId;
  entity.serviceAccountId = record.serviceAccountId;
  entity.amountIn = record.amountIn;
  entity.amountOut = record.amountOut;
  entity.currency = record.currency;
  entity.status = record.status as TransactionStatus;
  entity.paymentMethod = record.paymentMethod as PaymentMethod;
  entity.externalId = record.externalId ?? undefined;
  entity.createdAt = new Date(record.createdAt);
  entity.updatedAt = new Date(record.updatedAt);
  return entity;
};

@Injectable()
export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: CreateTransactionRecord): Promise<Transaction> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        id: data.id,
        userId: data.userId,
        serviceAccountId: data.serviceAccountId,
        amountIn: data.amountIn ?? 0,
        amountOut: data.amountOut ?? 0,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.paymentMethod,
        externalId: data.externalId ?? null,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async findById(id: string): Promise<Transaction | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update({
        userId: transaction.userId,
        serviceAccountId: transaction.serviceAccountId,
        amountIn: transaction.amountIn,
        amountOut: transaction.amountOut,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        externalId: transaction.externalId ?? null,
        updatedAt:
          transaction.updatedAt?.toISOString() ?? new Date().toISOString(),
      })
      .eq('id', transaction.id)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}

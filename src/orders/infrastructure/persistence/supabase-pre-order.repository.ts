import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { PreOrder } from '../../domain/entities/pre-order.entity';
import {
  CreatePreOrderRecord,
  PreOrderRepository,
} from '../../domain/repositories/pre-order.repository';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../../domain/types/commission.types';

const TABLE = quoted('PreOrder');

const mapToDomain = (record: any): PreOrder | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new PreOrder();
  entity.id = record.id;
  entity.userId = record.userId;
  entity.sellerId = record.sellerId;
  entity.productId = record.productId;
  entity.quantity = record.quantity;
  entity.totalPrice = record.totalPrice;
  entity.currency = record.currency;
  entity.commissions = record.commissions as CommissionMatrix;
  entity.calculatedCommissions = record.calculatedCommissions as
    | CalculatedCommission
    | undefined;
  entity.createdAt = new Date(record.createdAt);
  entity.updatedAt = new Date(record.updatedAt);
  return entity;
};

@Injectable()
export class SupabasePreOrderRepository implements PreOrderRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: CreatePreOrderRecord): Promise<PreOrder> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        id: data.id,
        userId: data.userId,
        sellerId: data.sellerId,
        productId: data.productId,
        quantity: data.quantity,
        totalPrice: data.totalPrice ?? 0,
        currency: data.currency,
        commissions: data.commissions,
        calculatedCommissions: data.calculatedCommissions ?? null,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async findById(id: string): Promise<PreOrder | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async save(preOrder: PreOrder): Promise<PreOrder> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update({
        userId: preOrder.userId,
        sellerId: preOrder.sellerId,
        productId: preOrder.productId,
        quantity: preOrder.quantity,
        totalPrice: preOrder.totalPrice,
        currency: preOrder.currency,
        commissions: preOrder.commissions,
        calculatedCommissions: preOrder.calculatedCommissions ?? null,
        updatedAt:
          preOrder.updatedAt?.toISOString() ?? new Date().toISOString(),
      })
      .eq('id', preOrder.id)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}

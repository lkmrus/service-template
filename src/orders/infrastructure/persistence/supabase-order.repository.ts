import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { handleSupabaseError, quoted } from '../../../supabase/supabase.utils';
import { Order } from '../../domain/entities/order.entity';
import {
  CreateOrderRecord,
  OrderRepository,
} from '../../domain/repositories/order.repository';
import { OrderStatus } from '../../domain/enums/order.enums';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../../domain/types/commission.types';

const TABLE = quoted('Order');

const mapToDomain = (record: any): Order | undefined => {
  if (!record) {
    return undefined;
  }
  const entity = new Order();
  entity.id = record.id;
  entity.preOrderId = record.preOrderId ?? undefined;
  entity.transactionId = record.transactionId ?? undefined;
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
  entity.status = record.status as OrderStatus;
  entity.createdAt = new Date(record.createdAt);
  entity.updatedAt = new Date(record.updatedAt);
  return entity;
};

@Injectable()
export class SupabaseOrderRepository implements OrderRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: CreateOrderRecord): Promise<Order> {
    const { data: record, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .insert({
        id: data.id,
        preOrderId: data.preOrderId ?? null,
        transactionId: data.transactionId ?? null,
        userId: data.userId,
        sellerId: data.sellerId,
        productId: data.productId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        currency: data.currency,
        commissions: data.commissions,
        calculatedCommissions: data.calculatedCommissions ?? null,
        status: data.status ?? OrderStatus.PAID,
      })
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(record)!;
  }

  async findById(id: string): Promise<Order | undefined> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    handleSupabaseError(error);
    return mapToDomain(data);
  }

  async save(order: Order): Promise<Order> {
    const { data, error } = await this.supabase
      .getClient()
      .from(TABLE)
      .update({
        preOrderId: order.preOrderId ?? null,
        transactionId: order.transactionId ?? null,
        userId: order.userId,
        sellerId: order.sellerId,
        productId: order.productId,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        currency: order.currency,
        commissions: order.commissions,
        calculatedCommissions: order.calculatedCommissions ?? null,
        status: order.status,
        updatedAt: order.updatedAt?.toISOString() ?? new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .single();
    handleSupabaseError(error);
    return mapToDomain(data)!;
  }
}

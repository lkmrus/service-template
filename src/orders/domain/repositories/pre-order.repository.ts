import { PreOrder } from '../entities/pre-order.entity';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../types/commission.types';

export const PRE_ORDER_REPOSITORY = Symbol('PRE_ORDER_REPOSITORY');

export interface CreatePreOrderRecord {
  id?: string;
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  currency: string;
  commissions: CommissionMatrix;
  totalPrice?: number;
  calculatedCommissions?: CalculatedCommission | null;
}

export interface PreOrderRepository {
  create(data: CreatePreOrderRecord): Promise<PreOrder>;
  findById(id: string): Promise<PreOrder | undefined>;
  save(preOrder: PreOrder): Promise<PreOrder>;
}

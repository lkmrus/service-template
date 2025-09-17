import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order.enums';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../types/commission.types';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface CreateOrderRecord {
  id?: string;
  preOrderId?: string | null;
  transactionId?: string | null;
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  commissions: CommissionMatrix;
  calculatedCommissions?: CalculatedCommission | null;
  status?: OrderStatus;
}

export interface OrderRepository {
  create(data: CreateOrderRecord): Promise<Order>;
  findById(id: string): Promise<Order | undefined>;
  save(order: Order): Promise<Order>;
}

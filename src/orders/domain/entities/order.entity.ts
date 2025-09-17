import { OrderStatus } from '../enums/order.enums';
import {
  CalculatedCommission,
  CommissionMatrix,
} from '../types/commission.types';

export class Order {
  id: string;
  preOrderId?: string;
  transactionId?: string;
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  commissions: CommissionMatrix;
  calculatedCommissions?: CalculatedCommission;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

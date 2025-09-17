import {
  CalculatedCommission,
  CommissionMatrix,
} from '../types/commission.types';

export class PreOrder {
  id: string;
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  commissions: CommissionMatrix;
  calculatedCommissions?: CalculatedCommission;
  createdAt: Date;
  updatedAt: Date;
}

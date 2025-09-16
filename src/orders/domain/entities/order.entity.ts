import { OrderStatus } from '../enums/order.enums';

export class Order {
  id: string;
  preOrderId: string;
  transactionId: string;
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  commissions: any;
  calculatedCommissions: any;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

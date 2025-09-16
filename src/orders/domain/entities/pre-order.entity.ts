export class PreOrder {
  id: string;
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  commissions: any; // { USD: {fix: 0.3, commisionRate: 1}, EUR: {}}
  calculatedCommissions: any; // {fix: calculatedSum, percentageRate: calculatedSum, total: fix + percentageRate}
  createdAt: Date;
  updatedAt: Date;
}

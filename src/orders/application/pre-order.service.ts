import { Injectable } from '@nestjs/common';
import { PreOrder } from '../domain/entities/pre-order.entity';

@Injectable()
export class PreOrderService {
  /**
   * Creates a new pre-order.
   * @param data - The data for the new pre-order.
   * @returns The created pre-order.
   */
  async createPreOrder(data: Partial<PreOrder>): Promise<PreOrder> {
    const preOrder = { ...data } as PreOrder;
    // In a real implementation, we would save the pre-order to the database
    return preOrder;
  }

  /**
   * Calculates the total price of a pre-order, including commissions.
   * @param preOrder - The pre-order to calculate the price for.
   * @returns The pre-order with the calculated total price and commissions.
   */
  async calculateTotalPrice(preOrder: PreOrder): Promise<PreOrder> {
    const { commissions, quantity } = preOrder;
    const productPrice = 100; // In a real implementation, we would get this from the product service

    const commissionConfig = commissions[preOrder.currency];
    if (!commissionConfig) {
      throw new Error(
        `Commissions not configured for currency: ${preOrder.currency}`,
      );
    }

    const fix = commissionConfig.fix;
    const percentageRate = commissionConfig.commisionRate;

    const calculatedSum = productPrice * quantity;
    const calculatedPercentage = (calculatedSum * percentageRate) / 100;

    preOrder.calculatedCommissions = {
      fix,
      percentageRate: calculatedPercentage,
      total: fix + calculatedPercentage,
    };

    preOrder.totalPrice = calculatedSum + preOrder.calculatedCommissions.total;

    return preOrder;
  }
}

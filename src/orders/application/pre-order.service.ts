import { BadRequestException, Injectable } from '@nestjs/common';
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
    const { currency, commissions, quantity = 0 } = preOrder;
    if (!currency) {
      throw new BadRequestException(
        'currency must be provided for pre-order calculation',
      );
    }

    if (!commissions) {
      throw new BadRequestException(
        'commission matrix must be provided for pre-order calculation',
      );
    }

    const commissionConfig = commissions[currency];
    if (!commissionConfig) {
      throw new BadRequestException(
        `commissions are not configured for currency: ${currency}`,
      );
    }

    const { fix, commissionRate } = commissionConfig;
    const productPrice = 100; // In a real implementation, we would get this from the product service

    const calculatedSum = productPrice * quantity;
    const percentageAmount = (calculatedSum * commissionRate) / 100;

    preOrder.calculatedCommissions = {
      fix,
      percentageAmount,
      total: fix + percentageAmount,
    };

    preOrder.totalPrice = calculatedSum + preOrder.calculatedCommissions.total;

    return preOrder;
  }
}

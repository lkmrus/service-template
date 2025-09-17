import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PreOrder } from '../domain/entities/pre-order.entity';
import {
  CommissionMatrix,
  CommissionRateShape,
} from '../domain/types/commission.types';
import {
  PRE_ORDER_REPOSITORY,
  PreOrderRepository,
} from '../domain/repositories/pre-order.repository';

export interface CreatePreOrderInput {
  userId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  currency: string;
  commissions: CommissionMatrix;
}

@Injectable()
export class PreOrderService {
  constructor(
    @Inject(PRE_ORDER_REPOSITORY)
    private readonly preOrderRepository: PreOrderRepository,
  ) {}

  /**
   * Creates a new pre-order.
   * @param data - The data for the new pre-order.
   * @returns The created pre-order.
   */
  async createPreOrder(data: CreatePreOrderInput): Promise<PreOrder> {
    const preOrder = await this.preOrderRepository.create({
      userId: data.userId,
      sellerId: data.sellerId,
      productId: data.productId,
      quantity: data.quantity,
      currency: data.currency,
      commissions: data.commissions,
    });

    return this.calculateTotalPrice(preOrder);
  }

  async findById(id: string): Promise<PreOrder> {
    const preOrder = await this.preOrderRepository.findById(id);
    if (!preOrder) {
      throw new NotFoundException(`Pre-order with id ${id} not found`);
    }
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
    const { fraction } = this.resolveCommissionRate(commissionRate);
    const productPrice = 100; // In a real implementation, we would get this from the product service

    const calculatedSum = productPrice * quantity;
    const percentageAmount = calculatedSum * fraction;

    preOrder.calculatedCommissions = {
      fix,
      percentageAmount,
      total: fix + percentageAmount,
    };

    preOrder.totalPrice = calculatedSum + preOrder.calculatedCommissions.total;
    preOrder.updatedAt = new Date();

    return this.preOrderRepository.save(preOrder);
  }

  private resolveCommissionRate(commissionRate: CommissionRateShape): {
    fraction: number;
    percentage: number;
  } {
    if (!commissionRate) {
      throw new BadRequestException('commission rate must be provided');
    }

    const { percentage, fraction } = commissionRate;

    const hasPercentage = percentage !== undefined;
    const hasFraction = fraction !== undefined;

    if (!hasPercentage && !hasFraction) {
      throw new BadRequestException(
        'commission rate must include percentage or fraction value',
      );
    }

    if (hasPercentage) {
      if (percentage < 0 || percentage > 100) {
        throw new BadRequestException(
          'commission percentage must be between 0 and 100',
        );
      }
    }

    if (hasFraction) {
      if (fraction < 0 || fraction > 1) {
        throw new BadRequestException(
          'commission fraction must be between 0 and 1',
        );
      }
    }

    const normalizedFraction = hasFraction ? fraction! : percentage! / 100;

    const normalizedPercentage = hasPercentage
      ? percentage!
      : normalizedFraction * 100;

    return {
      fraction: normalizedFraction,
      percentage: normalizedPercentage,
    };
  }
}

import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { PreOrderService } from '../../orders/application/pre-order.service';
import { OrdersService } from '../../orders/application/orders/orders.service';
import { PreOrderModel } from '../models/pre-order.model';
import { OrderModel } from '../models/order.model';
import { CreatePreOrderInput } from '../inputs/orders.input';
import { CommissionMatrix } from '../../orders/domain/types/commission.types';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { OrderOwnerOrSuperAdminGuard } from '../../orders/presentation/orders/guards/order-owner-or-super-admin.guard';

@Resolver()
export class OrdersResolver {
  constructor(
    private readonly preOrderService: PreOrderService,
    private readonly ordersService: OrdersService,
  ) {}

  @Mutation(() => PreOrderModel)
  async createPreOrder(
    @Args('input') input: CreatePreOrderInput,
  ): Promise<PreOrderModel> {
    const commissions: CommissionMatrix = {};
    input.commissions.forEach((entry) => {
      const rate = entry.definition.commissionRate;
      if (rate.percentage === undefined && rate.fraction === undefined) {
        throw new BadRequestException(
          'Commission rate requires percentage or fraction value',
        );
      }
      commissions[entry.currency] = {
        fix: entry.definition.fix,
        commissionRate: {
          percentage: rate.percentage,
          fraction: rate.fraction,
        },
      };
    });

    return this.preOrderService.createPreOrder({
      userId: input.userId,
      sellerId: input.sellerId,
      productId: input.productId,
      quantity: input.quantity,
      currency: input.currency,
      commissions,
    });
  }

  @Mutation(() => OrderModel)
  @UseGuards(GqlAuthGuard, OrderOwnerOrSuperAdminGuard)
  async completeOrder(@Args('id') id: string): Promise<OrderModel> {
    return this.ordersService.completeOrder(id);
  }

  @Mutation(() => OrderModel)
  @UseGuards(GqlAuthGuard, OrderOwnerOrSuperAdminGuard)
  async rejectOrder(@Args('id') id: string): Promise<OrderModel> {
    return this.ordersService.rejectOrder(id);
  }
}

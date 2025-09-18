import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SuperAdminService } from '../../../../super-admin/super-admin.service';
import { OrdersService } from '../../../application/orders/orders.service';

@Injectable()
export class OrderOwnerOrSuperAdminGuard implements CanActivate {
  constructor(
    private superAdminService: SuperAdminService,
    private ordersService: OrdersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, orderId } = this.resolveContextValues(context);

    if (!user) {
      return false;
    }

    if (this.superAdminService.isSuperAdmin(user.id)) {
      return true;
    }

    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      return false;
    }
    return order.userId === user.id;
  }

  private resolveContextValues(context: ExecutionContext) {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return { user: request.user, orderId: request.params?.id };
    }

    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs<{ id?: string; input?: { id?: string } }>();
    const orderId = args.id ?? args.input?.id;

    return { user: request?.user, orderId };
  }
}

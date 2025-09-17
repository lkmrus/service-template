import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SuperAdminService } from '../../../../super-admin/super-admin.service';
import { OrdersService } from '../../../application/orders/orders.service';

@Injectable()
export class OrderOwnerOrSuperAdminGuard implements CanActivate {
  constructor(
    private superAdminService: SuperAdminService,
    private ordersService: OrdersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.id;

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
}

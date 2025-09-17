import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../../application/orders/orders.service';
import { PreOrderService } from '../../application/pre-order.service';
import { OrderOwnerOrSuperAdminGuard } from './guards/order-owner-or-super-admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminService } from '../../../super-admin/super-admin.service';
import { ConfigService } from '@nestjs/config';

class OrdersServiceMock {
  completeOrder(id: string) {
    return { id, status: 'COMPLETED' };
  }
  rejectOrder(id: string) {
    return { id, status: 'REJECTED' };
  }
  findOne(id: string) {
    return { id, userId: 'user123' };
  }
}

class SuperAdminServiceMock {
  isSuperAdmin(uuid: string) {
    return uuid === 'super-admin-uuid';
  }
}

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useClass: OrdersServiceMock },
        { provide: PreOrderService, useValue: {} },
        { provide: SuperAdminService, useClass: SuperAdminServiceMock },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(OrderOwnerOrSuperAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('rejectOrder', () => {
    it('should reject an order', async () => {
      const orderId = '123';
      const result = await controller.rejectOrder(orderId);
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('completeOrder', () => {
    it('should complete an order', async () => {
      const orderId = '123';
      jest.spyOn(ordersService, 'completeOrder');

      const result = await controller.completeOrder(orderId);

      expect(ordersService.completeOrder).toHaveBeenCalledWith(orderId);
      expect(result.status).toBe('COMPLETED');
    });
  });
});

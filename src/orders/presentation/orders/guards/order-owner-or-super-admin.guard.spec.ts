import { OrderOwnerOrSuperAdminGuard } from './order-owner-or-super-admin.guard';
import { SuperAdminService } from '../../../../super-admin/super-admin.service';
import { OrdersService } from '../../../application/orders/orders.service';
import { ExecutionContext } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order.enums';

describe('OrderOwnerOrSuperAdminGuard', () => {
  let guard: OrderOwnerOrSuperAdminGuard;
  let superAdminService: SuperAdminService;
  let ordersService: OrdersService;

  const mockOrder: Order = {
    id: 'order123',
    userId: 'user123',
    preOrderId: '',
    transactionId: '',
    sellerId: '',
    productId: '',
    quantity: 0,
    totalPrice: 0,
    currency: '',
    commissions: null,
    calculatedCommissions: null,
    status: OrderStatus.PAID,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    superAdminService = {
      isSuperAdmin: jest.fn(),
    } as any;
    ordersService = {
      findOne: jest.fn(),
    } as any;
    guard = new OrderOwnerOrSuperAdminGuard(superAdminService, ordersService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if user is super admin', async () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(true);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'super-admin-uuid' }, params: { id: 'order123' } }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should return true if user is order owner', async () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(false);
    jest.spyOn(ordersService, 'findOne').mockResolvedValue(mockOrder);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'user123' }, params: { id: 'order123' } }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should return false if user is not super admin and not order owner', async () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(false);
    jest.spyOn(ordersService, 'findOne').mockResolvedValue(mockOrder);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'another-user-uuid' }, params: { id: 'order123' } }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should return false if order not found', async () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(false);
    jest.spyOn(ordersService, 'findOne').mockResolvedValue(undefined);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'user123' }, params: { id: 'nonexistent-order' } }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });

  it('should return false if user is undefined', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ params: { id: 'order123' } }),
      }),
    } as ExecutionContext;
    await expect(guard.canActivate(context)).resolves.toBe(false);
  });
});

import { SuperAdminOnlyGuard } from './super-admin-only.guard';
import { SuperAdminService } from '../../../../super-admin/super-admin.service';
import { ExecutionContext } from '@nestjs/common';

describe('SuperAdminOnlyGuard', () => {
  let guard: SuperAdminOnlyGuard;
  let superAdminService: SuperAdminService;

  beforeEach(() => {
    superAdminService = {
      isSuperAdmin: jest.fn(),
    } as any;
    guard = new SuperAdminOnlyGuard(superAdminService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if user is super admin', () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(true);
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'super-admin-uuid' } }),
      }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user is not super admin', () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(false);
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'regular-user-uuid' } }),
      }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false if user is undefined', () => {
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(false);
  });
});

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
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'super-admin-uuid' } }),
      }),
    } as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user is not super admin', () => {
    jest.spyOn(superAdminService, 'isSuperAdmin').mockReturnValue(false);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'regular-user-uuid' } }),
      }),
    } as ExecutionContext;
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false if user is undefined', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;
    expect(guard.canActivate(context)).toBe(false);
  });
});

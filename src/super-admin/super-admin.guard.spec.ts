import { SuperAdminGuard } from './super-admin.guard';
import { SuperAdminService } from './super-admin.service';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;
  let superAdminService: SuperAdminService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('super-admin-uuid'),
    } as any;
    superAdminService = new SuperAdminService(configService);
    guard = new SuperAdminGuard(superAdminService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if user is super admin', () => {
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'super-admin-uuid' } }),
      }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user is not super admin', () => {
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

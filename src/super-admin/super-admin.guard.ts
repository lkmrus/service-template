import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private superAdminService: SuperAdminService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return this.superAdminService.isSuperAdmin(user.userId);
  }
}

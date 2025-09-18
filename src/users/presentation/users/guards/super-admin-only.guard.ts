import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SuperAdminService } from '../../../../super-admin/super-admin.service';

@Injectable()
export class SuperAdminOnlyGuard implements CanActivate {
  constructor(private superAdminService: SuperAdminService) {}

  canActivate(context: ExecutionContext): boolean {
    const user = this.getUser(context);

    if (!user) {
      return false;
    }

    return this.superAdminService.isSuperAdmin(user.id);
  }

  private getUser(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest().user;
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req?.user;
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminService.name);
  private superAdminUuid?: string;

  constructor(private configService: ConfigService) {
    const configuredValue = this.configService.get<string>('SUPER_ADMIN_UUID');
    this.superAdminUuid = configuredValue?.trim() ? configuredValue : undefined;
  }

  onModuleInit() {
    if (!this.superAdminUuid) {
      this.logger.warn(
        'SUPER_ADMIN_UUID is not defined; super-admin only features will be unavailable.',
      );
    }
  }

  isSuperAdmin(uuid: string): boolean {
    if (!this.superAdminUuid) {
      return false;
    }
    return uuid === this.superAdminUuid;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminService {
  private superAdminUuid: string;

  constructor(private configService: ConfigService) {
    this.superAdminUuid =
      this.configService.get<string>('SUPER_ADMIN_UUID') ?? '';

    if (!this.superAdminUuid) {
      throw new Error(
        'SUPER_ADMIN_UUID is not defined in environment variables',
      );
    }
  }

  isSuperAdmin(uuid: string): boolean {
    return uuid === this.superAdminUuid;
  }
}

import { Module } from '@nestjs/common';
import { UsersService } from './application/users/users.service';
import { UsersController } from './presentation/users/users.controller';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { SuperAdminOnlyGuard } from './presentation/users/guards/super-admin-only.guard';

@Module({
  imports: [SuperAdminModule],
  providers: [
    UsersService,
    SuperAdminOnlyGuard,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

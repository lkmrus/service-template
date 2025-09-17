import { Module } from '@nestjs/common';
import { UsersService } from './application/users/users.service';
import { UsersController } from './presentation/users/users.controller';
import { SuperAdminModule } from '../super-admin/super-admin.module';

@Module({
  imports: [SuperAdminModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

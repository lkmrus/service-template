import { Module } from '@nestjs/common';
import { UserContextMiddleware } from './middleware/user-context.middleware';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [UserContextMiddleware],
  exports: [UserContextMiddleware],
})
export class CommonMiddlewareModule {}

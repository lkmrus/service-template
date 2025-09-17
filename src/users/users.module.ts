import { Module } from '@nestjs/common';
import { UsersService } from './application/users/users.service';
import { UsersController } from './presentation/users/users.controller';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { SupabaseUserRepository } from './infrastructure/persistence/supabase-user.repository';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/config';
import { SuperAdminOnlyGuard } from './presentation/users/guards/super-admin-only.guard';

@Module({
  imports: [SuperAdminModule],
  providers: [
    UsersService,
    SuperAdminOnlyGuard,
    PrismaUserRepository,
    SupabaseUserRepository,
    {
      provide: USER_REPOSITORY,
      useFactory: (
        configService: ConfigService<AppConfig>,
        prismaRepo: PrismaUserRepository,
        supabaseRepo: SupabaseUserRepository,
      ) => {
        const provider =
          configService.get<'supabase' | 'prisma'>('dataProvider') ??
          'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [ConfigService, PrismaUserRepository, SupabaseUserRepository],
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

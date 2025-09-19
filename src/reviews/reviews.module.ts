import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReviewsService } from './application/reviews.service';
import { ReviewsController } from './presentation/reviews/reviews.controller';
import { ReviewsAdminController } from './presentation/reviews/reviews-admin.controller';
import {
  REVIEW_REPOSITORY,
  ReviewRepository,
} from './domain/repositories/review.repository';
import { PrismaReviewRepository } from './infrastructure/persistence/prisma-review.repository';
import { SupabaseReviewRepository } from './infrastructure/persistence/supabase-review.repository';
import { AppConfig } from '../config/config';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { SuperAdminGuard } from '../super-admin/super-admin.guard';

@Module({
  imports: [ConfigModule, SuperAdminModule],
  controllers: [ReviewsController, ReviewsAdminController],
  providers: [
    ReviewsService,
    PrismaReviewRepository,
    SupabaseReviewRepository,
    SuperAdminGuard,
    {
      provide: REVIEW_REPOSITORY,
      useFactory: (
        configService: ConfigService<AppConfig>,
        prismaRepo: PrismaReviewRepository,
        supabaseRepo: SupabaseReviewRepository,
      ): ReviewRepository => {
        const provider =
          configService.get<'supabase' | 'prisma'>('dataProvider') ??
          'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [ConfigService, PrismaReviewRepository, SupabaseReviewRepository],
    },
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}

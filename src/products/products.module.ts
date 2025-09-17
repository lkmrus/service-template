import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsService } from './application/products.service';
import { ProductsController } from './presentation/products/products.controller';
import { ProductsAdminController } from './presentation/products/products-admin.controller';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from './domain/repositories/product.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';
import { SupabaseProductRepository } from './infrastructure/persistence/supabase-product.repository';
import { AppConfig } from '../config/config';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { SuperAdminGuard } from '../super-admin/super-admin.guard';

@Module({
  imports: [ConfigModule, SuperAdminModule],
  controllers: [ProductsController, ProductsAdminController],
  providers: [
    ProductsService,
    PrismaProductRepository,
    SupabaseProductRepository,
    SuperAdminGuard,
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (
        configService: ConfigService<AppConfig>,
        prismaRepo: PrismaProductRepository,
        supabaseRepo: SupabaseProductRepository,
      ): ProductRepository => {
        const provider =
          configService.get<'supabase' | 'prisma'>('dataProvider') ??
          'supabase';
        return provider === 'prisma' ? prismaRepo : supabaseRepo;
      },
      inject: [
        ConfigService,
        PrismaProductRepository,
        SupabaseProductRepository,
      ],
    },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}

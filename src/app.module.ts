import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './billing/billing.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransactionsModule } from './transactions/transactions.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { CommonMiddlewareModule } from './common/common-middleware.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { appConfig, configValidationSchema } from './config/config';
import { ProductsModule } from './products/products.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { GraphqlModule } from './graphql/graphql.module';
import { PinoLoggerModule } from './pino-logger/pino-logger.module';
import { CronSchedulerModule } from './cron-scheduler/cron-scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    PrismaModule,
    SupabaseModule,
    BillingModule,
    EventEmitterModule.forRoot(),
    TransactionsModule,
    OrdersModule,
    ProductsModule,
    PubSubModule,
    GraphqlModule.forRootAsync(),
    UsersModule,
    AuthModule,
    SuperAdminModule,
    CommonMiddlewareModule,
    PinoLoggerModule,
    CronSchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

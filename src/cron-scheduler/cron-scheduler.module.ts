import { DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { CronSchedulerService } from './cron-scheduler.service';
import { CronProcessor } from './cron-scheduler.processor';
import { CronSchedulerController } from './cron-scheduler.controller';
import type { RedisOptions } from 'ioredis';
import { ClientRedis } from '@nestjs/microservices';

export class CronSchedulerModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: CronSchedulerModule,
      imports: [
        BullModule.forRootAsync({
          useFactory: async (
            configService: ConfigService,
            redisService: ClientRedis,
          ) => {
            const namespace =
              configService.get<string>('cron.redisNamespace') ??
              'monolith-cron';

            const clientOptions =
              typeof redisService.getClientOptions === 'function'
                ? redisService.getClientOptions()
                : undefined;

            const baseConnection: RedisOptions = {
              lazyConnect: true,
              ...(clientOptions ?? {}),
            } as RedisOptions;

            const keyPrefix = namespace.endsWith(':')
              ? namespace
              : `${namespace}:`;

            return {
              connection: {
                ...baseConnection,
                connectionName: namespace,
                keyPrefix,
              },
            };
          },
          inject: [ConfigService, ClientRedis],
        }),
        BullModule.registerQueue({
          name: 'cron-scheduler',
          defaultJobOptions: {
            attempts: 1,
            removeOnComplete: true,
            removeOnFail: {
              age: 7 * 24 * 3600,
            },
          },
        }),
      ],
      providers: [CronSchedulerService, CronProcessor, ConfigService],
      controllers: [CronSchedulerController],
      exports: [CronSchedulerService],
    };
  }
}

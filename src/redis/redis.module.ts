import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, RedisOptions, Transport } from '@nestjs/microservices';
import { REDIS_PUB_SUB_CLIENT } from './redis.constants';
import { AppConfig } from '../config/config';

@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    const redisClientsModule = ClientsModule.registerAsync([
      {
        name: REDIS_PUB_SUB_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService<AppConfig>): RedisOptions => {
          const hostRaw: unknown = configService.getOrThrow<string>(
            'redis.host',
            {
              infer: true,
            },
          );
          const portRaw: unknown = configService.getOrThrow<number>(
            'redis.port',
            {
              infer: true,
            },
          );

          const host: string =
            typeof hostRaw === 'string' && hostRaw.length > 0
              ? hostRaw
              : 'localhost';
          const port: number =
            typeof portRaw === 'number' && Number.isFinite(portRaw)
              ? portRaw
              : 6379;

          return {
            transport: Transport.REDIS,
            options: {
              host,
              port,
              keepAlive: 0,
            },
          };
        },
      },
    ]);

    return {
      module: RedisModule,
      imports: [redisClientsModule],
      exports: [redisClientsModule],
    };
  }
}

import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { SharedRabbitmqService } from './shared-rabbitmq.service';
import { AppConfig } from '../config/config';

export class SharedRabbitMQModule {
  /**
   * Re-export the RabbitMQModule with the provided configuration.
   *
   * @param registerHandlers enable automatic handler registration, defaults to true
   * @returns SharedRabbitMQModule
   */
  static register(registerHandlers: boolean = true): DynamicModule {
    return {
      global: true,
      module: SharedRabbitMQModule,
      providers: [SharedRabbitmqService],
      imports: [
        RabbitMQModule.forRootAsync({
          useFactory: async (configService: ConfigService<AppConfig>) => {
            const rabbitConfig =
              configService.get<AppConfig['rabbit']>('rabbit');

            if (!rabbitConfig?.uri) {
              throw new Error('RabbitMQ configuration is missing');
            }

            return {
              ...rabbitConfig,
              registerHandlers,
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [RabbitMQModule, SharedRabbitmqService],
    };
  }
}

import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { SharedRabbitmqService } from './shared-rabbitmq.service';

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
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: async (cfg: ConfigService) => ({ ...cfg.get('rabbit'), registerHandlers }),
          inject: [ConfigService],
        }),
      ],
      exports: [RabbitMQModule, SharedRabbitmqService],
    };
  }
}

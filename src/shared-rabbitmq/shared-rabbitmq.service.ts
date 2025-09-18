import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { SchemaValidation } from '@wasd-team/event-schema';
import { PublishRabbitLogger } from '../../common/decorators/logger-rabbit.decorator';
import { AsyncEvent } from '../../common/types/async-event.type';

@Injectable()
export class SharedRabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @SchemaValidation()
  @PublishRabbitLogger()
  async publishEvent(event: AsyncEvent<unknown>): Promise<void> {
    await this.amqpConnection.publish('events', event.pattern, event);
  }
}

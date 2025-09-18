import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

interface AsyncEvent<T> {
  pattern: string;
  data: T;
}

@Injectable()
export class SharedRabbitmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishEvent(event: AsyncEvent<unknown>): Promise<void> {
    await this.amqpConnection.publish('events', event.pattern, event);
  }
}

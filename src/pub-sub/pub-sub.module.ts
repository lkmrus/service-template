import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { PubSubService } from './pub-sub.service';

@Module({
  imports: [RedisModule.forRootAsync()],
  providers: [PubSubService],
  exports: [PubSubService],
})
export class PubSubModule {}

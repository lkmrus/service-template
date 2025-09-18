import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullmqAxiosService } from './bullmq-axios.service';
import { ConfigurableModuleClass } from './bullmq-axios.module-definition';
import { RedisModule } from '../redis/redis.module';

@Module({
  providers: [BullmqAxiosService],
  exports: [BullmqAxiosService],
  imports: [HttpModule, RedisModule],
})
export class BullmqAxiosModule extends ConfigurableModuleClass {}

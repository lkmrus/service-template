import { Module } from '@nestjs/common';
import { SentryService } from './sentry.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SentryService],
})
export class SentryModule {}

import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryService {
  constructor(private readonly configService: ConfigService) {
    const dsn = this.configService.get<string | null>('SENTRY_DSN', {
      infer: true,
    });

    if (!dsn) {
      return;
    }

    Sentry.init({
      dsn: dsn,
      environment: configService.get<string>(
        'SENTRY_ENVIRONMENT',
        'development',
        {
          infer: true,
        },
      ),
      normalizeDepth: 10,
    });
  }
}

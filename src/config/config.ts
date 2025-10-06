import * as Joi from 'joi';
import {
  MessageHandlerErrorBehavior,
  RabbitMQConfig,
} from '@golevelup/nestjs-rabbitmq';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().optional(),
  SUPABASE_URL: Joi.string().uri().optional(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
  DATA_PROVIDER: Joi.string().valid('supabase', 'prisma').default('supabase'),
  STRIPE_API_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  BILLING_SERVICE_ACCOUNT_ID: Joi.string().optional(),
  REDIS_HOST: Joi.string().hostname().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  RABBITMQ_DSN: Joi.string().uri().optional(),
});

export type DataProvider = 'supabase' | 'prisma';

export interface GQLConfig {
  persistedQueriesTTL: number;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface AppConfig {
  databaseUrl?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  dataProvider: DataProvider;
  stripeApiKey?: string;
  stripeWebhookSecret?: string;
  billingServiceAccountId?: string;
  gql: GQLConfig;
  redis: RedisConfig;
  rabbit: RabbitMQConfig;
}

export const appConfig = (): AppConfig => ({
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  dataProvider: (
    process.env.DATA_PROVIDER ?? 'supabase'
  ).toLowerCase() as DataProvider,
  stripeApiKey: process.env.STRIPE_API_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  billingServiceAccountId: process.env.BILLING_SERVICE_ACCOUNT_ID,
  gql: {
    persistedQueriesTTL: +(process.env.PERSISTED_QUERIES_TTL ?? '86400'),
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? '6379'),
  },
  rabbit: <RabbitMQConfig>{
    uri: process.env.RABBITMQ_DSN ?? 'amqp://localhost:5672',
    connectionInitOptions: {
      wait: false,
      reject: false,
      timeout: 1000,
      skipConnectionFailedLogging: true,
      skipDisconnectFailedLogging: true,
    },
    exchanges: [{ name: 'events', createExchangeIfNotExists: true }],
    enableControllerDiscovery: true,
    defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
  },
});

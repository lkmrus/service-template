import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().optional(),
  SUPABASE_URL: Joi.string().uri().optional(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
  DATA_PROVIDER: Joi.string().valid('supabase', 'prisma').default('supabase'),
  STRIPE_API_KEY: Joi.string().optional(),
});

export type DataProvider = 'supabase' | 'prisma';

export interface AppConfig {
  databaseUrl?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  dataProvider: DataProvider;
  stripeApiKey?: string;
}

export const appConfig = (): AppConfig => ({
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  dataProvider: (
    process.env.DATA_PROVIDER ?? 'supabase'
  ).toLowerCase() as DataProvider,
  stripeApiKey: process.env.STRIPE_API_KEY,
});

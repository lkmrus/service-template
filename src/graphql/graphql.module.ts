import { join } from 'path';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ClientRedis } from '@nestjs/microservices';
import {
  KeyValueCache,
  KeyValueCacheSetOptions,
} from '@apollo/utils.keyvaluecache';

import { SentryLoggerApolloPlugin } from '../common/plugins/sentryLoggerApolloPlugin';
import { formatGraphqlError } from './graphql-error-formatter';
import { GraphqlContext } from './graphql.interface';
import { RedisModule } from '../redis/redis.module';
import { REDIS_PUB_SUB_CLIENT } from '../redis/redis.constants';
import { AppConfig } from '../config/config';
import { GraphqlResolver } from './graphql.resolver';
import { ProductsResolver } from './resolvers/products.resolver';
import { ReviewsResolver } from './resolvers/reviews.resolver';
import { OrdersResolver } from './resolvers/orders.resolver';
import { BillingResolver } from './resolvers/billing.resolver';
import { UsersResolver } from './resolvers/users.resolver';
import { AuthResolver } from './resolvers/auth.resolver';
import { CartResolver } from './resolvers/cart.resolver';
import { JSONScalar } from './scalars/json.scalar';
import { ProductsModule } from '../products/products.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { OrdersModule } from '../orders/orders.module';
import { BillingModule } from '../billing/billing.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { CartsModule } from '../carts/carts.module';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { SuperAdminGuard } from '../super-admin/super-admin.guard';
import { SuperAdminOnlyGuard } from '../users/presentation/users/guards/super-admin-only.guard';
import { OrderOwnerOrSuperAdminGuard } from '../orders/presentation/orders/guards/order-owner-or-super-admin.guard';

type RedisCommandable = {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    ...args: (string | number)[]
  ): Promise<'OK' | null>;
  del(...keys: string[]): Promise<number>;
};

class RedisKeyValueCache implements KeyValueCache<string> {
  constructor(
    private readonly client: RedisCommandable,
    private readonly namespace: string,
  ) {}

  private namespaced(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<string | undefined> {
    const value = await this.client.get(this.namespaced(key));
    return value === null ? undefined : value;
  }

  async set(
    key: string,
    value: string,
    options?: KeyValueCacheSetOptions,
  ): Promise<void> {
    const namespacedKey = this.namespaced(key);
    const ttl = options?.ttl;

    if (ttl !== undefined && ttl !== null && ttl > 0) {
      const ttlSeconds = Math.ceil(ttl);
      await this.client.set(namespacedKey, value, 'EX', ttlSeconds);
      return;
    }

    await this.client.set(namespacedKey, value);
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.client.del(this.namespaced(key));
    return deleted > 0;
  }
}

@Module({})
export class GraphqlModule {
  static forRootAsync(): DynamicModule {
    const redisDynamicModule = RedisModule.forRootAsync();

    return {
      module: GraphqlModule,
      imports: [
        redisDynamicModule,
        SuperAdminModule,
        ProductsModule,
        ReviewsModule,
        OrdersModule,
        BillingModule,
        UsersModule,
        AuthModule,
        CartsModule,
        GraphQLModule.forRootAsync({
          imports: [redisDynamicModule],
          driver: ApolloDriver,
          useFactory: async (
            configService: ConfigService<AppConfig>,
            redisClient: ClientRedis,
          ): Promise<ApolloDriverConfig> => {
            const isProduction =
              configService.get<{ NODE_ENV: string }>(
                'NODE_ENV',
                'production',
                { infer: true },
              ) === 'production';

            const playground = !isProduction
              ? { settings: { 'request.credentials': 'same-origin' } }
              : false;

            await redisClient.connect();
            const [rawPubClient] = redisClient.unwrap<[unknown, unknown]>();

            if (
              !rawPubClient ||
              typeof (rawPubClient as { get?: unknown }).get !== 'function' ||
              typeof (rawPubClient as { set?: unknown }).set !== 'function' ||
              typeof (rawPubClient as { del?: unknown }).del !== 'function'
            ) {
              throw new Error('Redis publish client is not initialized');
            }

            const redisStore = rawPubClient as RedisCommandable;

            const cache = new RedisKeyValueCache(redisStore, 'apollo-cache');

            const persistedQueriesCache = new RedisKeyValueCache(
              redisStore,
              'apollo-persisted-queries',
            );

            const persistedQueriesRaw: unknown = configService.get<number>(
              'gql.persistedQueriesTTL',
              86400,
              {
                infer: true,
              },
            );
            const ttl: number =
              typeof persistedQueriesRaw === 'number' &&
              Number.isFinite(persistedQueriesRaw)
                ? persistedQueriesRaw
                : 86400;

            return {
              path: '/gql',
              playground,
              autoSchemaFile: isProduction
                ? true
                : join(process.cwd(), 'shared', 'schema.gql'),
              plugins: [
                ApolloServerPluginCacheControl({
                  defaultMaxAge: 0,
                  calculateHttpHeaders: true,
                }),
              ],
              stopOnTerminationSignals: true,
              persistedQueries: {
                cache: persistedQueriesCache,
                ttl,
              },
              cache,
              context: (ctx: GraphqlContext): GraphqlContext => {
                return {
                  dataSources: {},
                  req: ctx.req ?? ctx.extra?.request,
                  res: ctx.res,
                  connection: ctx.connection ?? ctx.extra?.socket,
                  dataloaders: new WeakMap<object, unknown>(),
                };
              },
              installSubscriptionHandlers: false,
              allowBatchedHttpRequests: true,
              introspection: !isProduction,
              formatError: formatGraphqlError,
            };
          },
          inject: [ConfigService, REDIS_PUB_SUB_CLIENT],
        }),
      ],
      providers: [
        SentryLoggerApolloPlugin,
        GraphqlResolver,
        JSONScalar,
        GqlAuthGuard,
        SuperAdminGuard,
        SuperAdminOnlyGuard,
        OrderOwnerOrSuperAdminGuard,
        ProductsResolver,
        ReviewsResolver,
        OrdersResolver,
        BillingResolver,
        UsersResolver,
        AuthResolver,
        CartResolver,
      ],
    };
  }
}

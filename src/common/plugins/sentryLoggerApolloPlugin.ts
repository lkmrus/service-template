import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import {
  GraphQLRequestContext as RequestContext,
  GraphQLRequestContextDidEncounterErrors as RequestContextDidEncounterErrors,
} from 'apollo-server-types';
import { PersistedQueryNotFoundError } from 'apollo-server-errors';
import * as Sentry from '@sentry/node';
import { Logger } from '@nestjs/common';
import { GraphqlContext } from '../../graphql';

@Plugin()
export class SentryLoggerApolloPlugin implements ApolloServerPlugin {
  requestDidStart(
    _context: RequestContext<GraphqlContext>,
  ): Promise<GraphQLRequestListener<GraphqlContext>> {
    void _context;
    const logger = new Logger(SentryLoggerApolloPlugin.name);

    return Promise.resolve({
      didEncounterErrors(
        ctx: RequestContextDidEncounterErrors<GraphqlContext>,
      ): Promise<void> {
        if (ctx.errors) {
          for (const err of ctx.errors) {
            // ignore persisted query errors because we are not interested in them
            if (err instanceof PersistedQueryNotFoundError) {
              continue;
            }

            logger.error(err.message, err);

            const rawIp = ctx.context?.req?.headers?.['x-real-ip'];
            const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

            Sentry.withScope((scope) => {
              scope.setContext('additionalData', {
                query: ctx.request.query,
                variables: ctx.request.variables,
                path: err.path,
              });

              if (ip) {
                scope.setContext('client', { ip });
                scope.setTag('ip', ip);
                scope.setUser({ ip });
              }

              Sentry.captureException(err);
            });
          }
        }

        return Promise.resolve();
      },
    });
  }
}

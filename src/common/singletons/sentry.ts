import * as Sentry from '@sentry/node';
import { Extras } from '@sentry/types';
import { storage } from './async-local-storage';

// Sentry will read SENTRY_DSN, SENTRY_ENVIRONMENT and SENTRY_RELEASE from environment variables
// automatically. If SENTRY_DSN variable does not exist, the SDK will just not send any events
Sentry.init({
  normalizeDepth: 10,
  defaultIntegrations: false,
  integrations: [
    // This integration allows the SDK to provide original function and method names,
    // even when those functions or methods are wrapped by our error or breadcrumb handlers
    Sentry.functionToStringIntegration(),
    // This integration allows you to configure linked errors. They'll be recursively read
    // up to a specified limit, and lookup will be performed by a specific key. By default,
    // the limit is set to 5 and the key used is "cause"
    Sentry.linkedErrorsIntegration(),
    // This integration attaches a global uncaught exception handler. It can be modified
    // to provide a custom shutdown function. The onFatalError option is meant to perform
    // a cleanup before the process exits, not fully prevent it from exiting
    Sentry.onUncaughtExceptionIntegration(),
    // This integration adds source file context to stack frames for captured exceptions
    Sentry.contextLinesIntegration(),
    // This integration extracts all non-native attributes from the error object and
    // attaches them to the event as the extra data
    Sentry.extraErrorDataIntegration(),
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('unhandledRejection', (reason: Error | any, _: Promise<any>) => {
  captureExceptionWithScope(reason);
});

export function captureExceptionWithScope(
  exception: Error,
  extras: Extras = {},
  fingerprint: string[] = [],
): void {
  Sentry.withScope((scope) => {
    const store = storage.getStore() ?? new Map<string, unknown>();

    const metadata = store.get('metadata') ?? {};
    const req = store.get('req') ?? {};
    const traceId = store.get('traceId');

    if (Object.keys(metadata).length > 0) {
      scope.setContext('metadata', metadata as Record<string, unknown>);
    }
    if (Object.keys(req).length > 0) {
      scope.setContext('request', req as Record<string, unknown>);
    }
    if (traceId) {
      scope.setTag('traceId', traceId as string);
    }

    if (Object.keys(extras).length > 0) {
      scope.setExtras(extras);
    }
    if (fingerprint.length > 0) {
      scope.setFingerprint(fingerprint);
    }

    Sentry.captureException(exception);
  });
}

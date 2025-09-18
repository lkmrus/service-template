import pino from 'pino';
import { storage } from './async-local-storage';

export const logger = pino({
  level: process.env.LOGGER_LEVEL ?? 'info',
  serializers: undefined,
  nestedKey: 'obj',
  mixin() {
    const store = storage.getStore() ?? new Map<string, unknown>();

    const metadata = store.get('metadata') ?? {};
    const req = store.get('req') ?? {};
    const traceId = store.get('traceId');

    return { metadata, req, traceId };
  },
});

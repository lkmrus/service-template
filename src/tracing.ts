import tracer from 'dd-trace';
import { storage } from './common/singletons';

// initialized in a different file to avoid hoisting.
tracer.init({
  // https://docs.datadoghq.com/tracing/connect_logs_and_traces/nodejs/
  logInjection: true,
});

tracer.use('express', {
  service: 'app',
  hooks: {
    request: (span: any, req: any) => {
      const store = storage.getStore() ?? new Map<string, unknown>();
      const metadata: any = store.get('metadata') ?? {};
      const traceId = store.get('traceId');

      if (metadata.userId) {
        span.addTags({ 'user.id': metadata.userId });
      }
      if (metadata.clientIpAddress) {
        span.addTags({ 'client.ip': metadata.clientIpAddress });
      }
      if (Object.keys(metadata).length > 0) {
        span.addTags({ metadata });
      }
      if (traceId) {
        span.addTags({ traceId });
      }
    },
  },
});

export default tracer;

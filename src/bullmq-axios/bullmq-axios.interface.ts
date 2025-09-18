import {
  CreateAxiosDefaults,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';
import { QueueOptions, BackoffStrategy } from 'bullmq';

export type IsUnrecoverableErrorFn = (
  err: AxiosError & AggregateError,
) => boolean;
export type CustomErrorHandlerFn = (err: AxiosError & AggregateError) => void;
export type debugDataLoggerProcessorFn = (job: AxiosRequestConfig) => any;

export interface BullmqAxiosConfig {
  // name of the integration, this will be used for logging and queue naming
  name: string;
  // enable/disable the integration, if disabled, no http requests will be made
  isEnabled: boolean;
  // enable/disable debug mode, this will log:
  //   - request config for each successful http request
  //   - request config and response body for each failed http request
  isDebug: boolean;
  // function to determine if an error is unrecoverable, 'true' will move job to failed state
  // even if the attemptsMade are lower than the expected limit. This is useful for errors like 4xx
  // where retrying the request will not help
  isUnrecoverableError?: IsUnrecoverableErrorFn;
  // custom error handler, this will be called after job is moved to 'failed' state and no more retries are possible,
  // i.e. only once per job
  errorHandler?: CustomErrorHandlerFn;
  // axios configuration, this will be used to create axios instance
  axios: CreateAxiosDefaults | AxiosInstance;
  // bullmq configuration, this will be used to create queue and worker
  bullmq?: Partial<QueueOptions> & { backoffStrategy?: BackoffStrategy };
  // enable/disable worker, if disabled, no bullmq worker will be created and no jobs will be processed
  // by this module instance, default is 'true'
  isWorkerEnabled?: boolean;
  debugDataLoggerProcessor?: debugDataLoggerProcessorFn;
}

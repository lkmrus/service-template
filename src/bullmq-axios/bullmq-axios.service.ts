import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  AxiosInstance,
  AxiosStatic,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import deepMerge from 'lodash/merge';
import get from 'lodash/get';
import {
  Queue,
  Worker,
  Job,
  UnrecoverableError,
  JobsOptions,
  ConnectionOptions,
} from 'bullmq';
import {
  BULLMQ_QUEUE_REDIS_NAMESPACE,
  BULLMQ_WORKER_REDIS_NAMESPACE,
} from '../common/constants';
import { MODULE_OPTIONS_TOKEN } from './bullmq-axios.module-definition';
import {
  BullmqAxiosConfig,
  IsUnrecoverableErrorFn,
  CustomErrorHandlerFn,
} from './bullmq-axios.interface';
import { AxiosUnrecoverableError } from './errors/axios-unrecoverable-error.error';
import { ClientRedis } from '@nestjs/microservices';
import type { RedisOptions } from 'ioredis';

const noop = () => {};

@Injectable()
export class BullmqAxiosService implements OnModuleDestroy {
  private logger = new Logger(BullmqAxiosService.name);
  private axios: AxiosInstance;
  private queue: Queue;
  private worker: Worker;
  private isUnrecoverableError: IsUnrecoverableErrorFn;
  private customErrorHandler: CustomErrorHandlerFn;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private config: BullmqAxiosConfig,
    @Inject(ClientRedis) private readonly redisService: ClientRedis,
    private readonly httpService: HttpService,
  ) {
    if (!config.isEnabled) {
      this.logger.log(`${config.name} integration is disabled`);
    }

    if (config.isDebug) {
      this.logger.log(`${config.name} integration is in debug mode`);
    }

    this.isUnrecoverableError = config.isUnrecoverableError ?? (() => false);
    this.customErrorHandler = config.errorHandler ?? noop;

    if (this.config.axios instanceof Function) {
      this.axios = this.config.axios;
    } else {
      this.axios = (this.httpService.axiosRef as AxiosStatic).create(
        this.config.axios,
      );
    }

    this.queue = new Queue(
      this.queueName,
      deepMerge(
        {
          connection: this.createRedisConnectionOptions(
            BULLMQ_QUEUE_REDIS_NAMESPACE,
          ),
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5 * 1000 },
            removeOnComplete: true,
            removeOnFail: true,
          },
        },
        this.config.bullmq,
      ),
    );

    if (get(this.config, 'isWorkerEnabled', true)) {
      this.worker = new Worker(
        this.queueName,
        async (job) => this.processQueue(job),
        {
          connection: this.createRedisConnectionOptions(
            BULLMQ_WORKER_REDIS_NAMESPACE,
          ),
          concurrency: 1,
          settings: {
            backoffStrategy: this.config.bullmq?.backoffStrategy,
          },
        },
      );

      this.worker
        .on('completed', (job) => this.completedJobHandler(job))
        .on('failed', (job, err: AxiosError & AggregateError) => {
          if (!job) {
            this.logger.error(
              err,
              `${this.config.name} worker failed without job reference`,
            );
            return;
          }

          this.failedJobHandler(job, err);
        });
    }
  }

  private get queueName() {
    return `monolith-bullmqaxios-${this.config.name}`;
  }

  private addToQueue(data: AxiosRequestConfig) {
    if (!this.config.isEnabled) {
      return;
    }

    const jobOptions: JobsOptions = {};

    if (this.config.bullmq?.backoffStrategy) {
      jobOptions.backoff = { type: 'custom' };
    }

    return this.queue.add(this.queueName, data, jobOptions);
  }

  private async processQueue(job: Job<AxiosRequestConfig>) {
    try {
      await this.axios.request(job.data);
    } catch (err) {
      if (this.isUnrecoverableError(err)) {
        throw new AxiosUnrecoverableError(err);
      } else {
        throw err;
      }
    }
  }

  private completedJobHandler(job: Job<AxiosRequestConfig>) {
    if (this.config.isDebug) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, ...jobData } = job.data;
      let loggerData = {
        request: jobData,
      };

      if (this.config.debugDataLoggerProcessor) {
        loggerData = this.config.debugDataLoggerProcessor(job);
      }

      this.logger.log(loggerData, `${this.config.name} request success`);
    }
  }

  private failedJobHandler(
    job: Job<AxiosRequestConfig>,
    err: AxiosError & AggregateError,
  ) {
    const jobErrorMsg = err.errors
      ? err.errors.map((e) => e.toString()).join(', ')
      : err.toString();

    // this method will try to add log with error to job asynchrounously and job can be already
    // removed from redis, so we just ignore any errors
    job.log(jobErrorMsg).catch(noop);

    const response = err.response?.data;

    // error with UnrecoverableError type will not be retried, even if attemptsMade < attempts
    if (
      !(err instanceof UnrecoverableError) &&
      job.attemptsMade < (job.opts.attempts ?? 0)
    ) {
      this.logger.warn(
        { request: job.data, response },
        `${this.config.name} request failed, retrying ${job.attemptsMade}... "${jobErrorMsg}"`,
      );

      return;
    }

    this.logger.error(
      { request: job.data, response },
      `${this.config.name} request failed, number of attempts made: ${job.attemptsMade}, "${jobErrorMsg}"`,
    );
    this.customErrorHandler(err);
  }

  private createRedisConnectionOptions(namespace: string): ConnectionOptions {
    const clientOptions =
      typeof this.redisService.getClientOptions === 'function'
        ? this.redisService.getClientOptions()
        : undefined;

    const baseConnection: RedisOptions = {
      lazyConnect: true,
      ...(clientOptions ?? {}),
    } as RedisOptions;

    const keyPrefix = namespace.endsWith(':') ? namespace : `${namespace}:`;

    return {
      ...baseConnection,
      connectionName: namespace,
      keyPrefix,
    };
  }

  async onModuleDestroy() {
    await this.queue.close();

    if (this.worker) {
      await this.worker.close();
    }
  }

  async delete(url: string, config: AxiosRequestConfig = {}): Promise<void> {
    await this.addToQueue({ ...config, method: 'delete', url });
  }

  async get(url: string, config: AxiosRequestConfig = {}): Promise<void> {
    await this.addToQueue({ ...config, method: 'get', url });
  }

  async head(url: string, config: AxiosRequestConfig = {}): Promise<void> {
    await this.addToQueue({ ...config, method: 'head', url });
  }

  async options(url: string, config: AxiosRequestConfig = {}): Promise<void> {
    await this.addToQueue({ ...config, method: 'options', url });
  }

  async post(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {},
  ): Promise<void> {
    await this.addToQueue({ ...config, method: 'post', url, data });
  }

  async put(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {},
  ): Promise<void> {
    await this.addToQueue({ ...config, method: 'put', url, data });
  }

  async patch(
    url: string,
    data?: any,
    config: AxiosRequestConfig = {},
  ): Promise<void> {
    await this.addToQueue({ ...config, method: 'patch', url, data });
  }
}

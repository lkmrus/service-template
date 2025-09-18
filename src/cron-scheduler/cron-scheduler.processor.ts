import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SOME_TASK } from './cron-jobs.constants';
import { captureExceptionWithScope } from '../common/singletons';

@Processor('cron-scheduler')
export class CronProcessor extends WorkerHost {
  private readonly logger = new Logger(CronProcessor.name);

  constructor() {
    super();
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error & AggregateError) {
    const jobErrorMsg = error.errors
      ? error.errors.map((e) => e.toString()).join(', ')
      : error.toString();

    job.log(jobErrorMsg).catch(() => {});

    this.logger.error(`Cron job "${job.name}" failed, "${jobErrorMsg}"`);

    captureExceptionWithScope(error, { name: job.name }, [
      'cron-scheduler',
      job.name,
      jobErrorMsg,
    ]);
  }

  async process(job: Job) {
    const jobHandlers = {
      [SOME_TASK]: () => this.someTask(),
    };

    const handler = jobHandlers[job.name] as
      | ((job: Job) => Promise<void>)
      | undefined;

    if (handler) {
      await handler(job);
    } else {
      this.logger.warn(`No handler found for job: ${job.name}`);
    }
  }

  private async someTask() {
    this.logger.log('Running some task...');
  }
}

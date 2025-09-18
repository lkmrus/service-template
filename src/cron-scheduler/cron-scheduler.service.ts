import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SOME_TASK } from './cron-jobs.constants';

@Injectable()
export class CronSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue('monolith-cron-scheduler')
    private readonly cronScheduler: Queue,
  ) {}

  async onModuleInit() {
    const jobs = await this.cronScheduler.getJobSchedulers();

    for await (const job of jobs) {
      await this.cronScheduler.removeJobScheduler(job.key);
    }

    await this.cronScheduler.obliterate({ force: true });

    await this.cronScheduler.add(SOME_TASK, null, {
      // every day at midnight (00:00)
      repeat: { pattern: '0 0 * * *' },
    });
  }

  async runJob(jobName: string): Promise<void> {
    const waitingJobs = await this.cronScheduler.getJobs([
      'waiting',
      'delayed',
      'paused',
    ]);
    const jobToRun = waitingJobs.find((job) => job.name === jobName);

    if (!jobToRun) {
      throw new BadRequestException(
        `Job "${jobName}" not found in waiting queue`,
      );
    }

    await jobToRun.promote();
  }
}

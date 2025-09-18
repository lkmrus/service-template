import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { CronSchedulerService } from './cron-scheduler.service';

@Controller('cron-scheduler')
export class CronSchedulerController {
  constructor(private readonly cronSchedulerService: CronSchedulerService) {}

  @Post('run')
  async runJob(@Body('jobName') jobName: string) {
    try {
      await this.cronSchedulerService.runJob(jobName);
      return { message: 'Cron job started successfully', status: 'success' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

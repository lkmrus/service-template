import { UnrecoverableError } from 'bullmq';
import { AxiosError } from 'axios';

export class AxiosUnrecoverableError extends UnrecoverableError {
  cause: AxiosError;

  constructor(error: AxiosError) {
    super(error.message);

    this.cause = error;
  }

  get response() {
    return this.cause.response;
  }
}

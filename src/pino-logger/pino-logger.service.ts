import { Injectable, ConsoleLogger } from '@nestjs/common';
import { Level } from 'pino';
import { logger } from '../common/singletons';

@Injectable()
export class PinoLogger extends ConsoleLogger {
  private getContext(args: unknown[]): string | undefined {
    if (args?.length <= 1) {
      return this.context;
    }

    const lastElement = args[args.length - 1];

    if (typeof lastElement !== 'string') {
      return this.context;
    }

    return lastElement;
  }

  private writeLog(level: Level, args: any[]): void {
    const context = this.getContext(args);

    if (typeof args[0] === 'string') {
      // nestjs log style: first argument is string and the rest are optional parameters
      const mergingObject = {};

      for (const [i, arg] of args.slice(1, context ? -1 : 0).entries()) {
        if (Object.prototype.toString.call(arg) === '[object Object]') {
          Object.assign(mergingObject, arg);
        } else {
          mergingObject[`argument${i}`] = arg;
        }
      }

      logger.child({ name: context })[level](mergingObject, args[0]);
    } else {
      // pino log style: first argument is object, then message string and the rest are interpolation values
      logger
        .child({ name: context })
        [level](args[0], args[1], ...args.slice(2));
    }
  }

  log(...args: any[]): any {
    this.writeLog('info', args);
  }

  error(...args: any[]): any {
    this.writeLog('error', args);
  }

  warn(...args: any[]): any {
    this.writeLog('warn', args);
  }

  debug(...args: any[]): any {
    this.writeLog('debug', args);
  }

  verbose(...args: any[]): any {
    this.writeLog('trace', args);
  }

  info(...args: any[]): any {
    this.writeLog('info', args);
  }

  fatal(...args) {
    this.writeLog('fatal', args);
  }

  trace(...args) {
    this.writeLog('trace', args);
  }
}

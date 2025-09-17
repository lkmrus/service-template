import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UserContextMiddleware } from './common/middleware/user-context.middleware';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.use((req, res, next) => {
    const middleware = app.get(UserContextMiddleware);
    middleware.use(req, res, next);
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

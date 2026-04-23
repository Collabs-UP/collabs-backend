import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENV_KEYS } from './config/env';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  void app.enableCors({
    origin: configService.getOrThrow<string>(ENV_KEYS.CORS_ORIGIN),
    credentials: true,
  });

  app.get(PrismaService);

  await app.listen(configService.getOrThrow<number>(ENV_KEYS.PORT));
}

void bootstrap();

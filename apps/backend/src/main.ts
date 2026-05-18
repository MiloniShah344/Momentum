import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe (validates DTOs automatically)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Momentum backend running on http://localhost:${port}/api`);
}
bootstrap();

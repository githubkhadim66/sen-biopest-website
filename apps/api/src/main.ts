import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { BlankStringsPipe } from './common/pipes/empty-strings.pipe';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'].filter(
    (key) => !process.env[key],
  );
  if (missing.length) {
    throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
  }
  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    const value = process.env[key]!;
    if (value.length < 32 || value.startsWith('change-me')) {
      throw new Error(`${key} doit être un secret aléatoire d'au moins 32 caractères`);
    }
  }
}

async function bootstrap() {
  assertProductionConfig();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  // Behind a reverse proxy (Nginx, Traefik…) so req.ip is the client IP for rate limiting
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // Uploaded images are displayed by the web app on another origin
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  app.useGlobalPipes(
    new BlankStringsPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Sen Biopest API')
      .setDescription('API de la plateforme digitale Sen Biopest')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  Logger.log(`Sen Biopest API running on port ${port}`, 'Bootstrap');
}
bootstrap();

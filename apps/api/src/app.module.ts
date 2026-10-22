import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CommercialRequestsModule } from './commercial-requests/commercial-requests.module';
import { TechnicalRequestsModule } from './technical-requests/technical-requests.module';
import { TrainingsModule } from './trainings/trainings.module';
import { PartnershipsModule } from './partnerships/partnerships.module';
import { ContactModule } from './contact/contact.module';
import { ContentModule } from './content/content.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { UPLOAD_DIR } from './uploads/multer.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolve(UPLOAD_DIR),
      serveRoot: '/uploads',
      serveStaticOptions: { maxAge: '30d', immutable: true, index: false },
    }),
    // 120 requests / minute / IP by default; public forms and login are stricter
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CommercialRequestsModule,
    TechnicalRequestsModule,
    TrainingsModule,
    PartnershipsModule,
    ContactModule,
    ContentModule,
    DashboardModule,
    UploadsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}

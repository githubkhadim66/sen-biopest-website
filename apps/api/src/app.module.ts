import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
  ],
})
export class AppModule {}

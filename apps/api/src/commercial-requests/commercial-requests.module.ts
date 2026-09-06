import { Module } from '@nestjs/common';
import { CommercialRequestsService } from './commercial-requests.service';
import { CommercialRequestsController } from './commercial-requests.controller';

@Module({
  controllers: [CommercialRequestsController],
  providers: [CommercialRequestsService],
})
export class CommercialRequestsModule {}

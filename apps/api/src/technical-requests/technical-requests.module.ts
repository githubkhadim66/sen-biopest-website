import { Module } from '@nestjs/common';
import { TechnicalRequestsService } from './technical-requests.service';
import { TechnicalRequestsController } from './technical-requests.controller';

@Module({
  controllers: [TechnicalRequestsController],
  providers: [TechnicalRequestsService],
})
export class TechnicalRequestsModule {}

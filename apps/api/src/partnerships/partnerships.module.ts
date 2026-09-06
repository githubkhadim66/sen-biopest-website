import { Module } from '@nestjs/common';
import { PartnershipsService } from './partnerships.service';
import { PartnershipsController } from './partnerships.controller';

@Module({
  controllers: [PartnershipsController],
  providers: [PartnershipsService],
})
export class PartnershipsModule {}

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PartnershipsService } from './partnerships.service';
import { CreatePartnershipRequestDto, UpdatePartnershipStatusDto, AddPartnershipNoteDto, PartnershipQueryDto } from './partnerships.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Partnerships')
@Controller('partnerships')
export class PartnershipsController {
  constructor(private service: PartnershipsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Body() dto: CreatePartnershipRequestDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: PartnershipQueryDto) {
    return this.service.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePartnershipStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/notes')
  addNote(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: AddPartnershipNoteDto) {
    return this.service.addNote(id, userId, dto);
  }
}

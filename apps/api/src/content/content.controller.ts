import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContentService } from './content.service';
import {
  BulkSettingsDto,
  CreateFaqDto,
  CreateTestimonialDto,
  TrackClickDto,
  UpdateFaqDto,
  UpdateTestimonialDto,
  UpsertBlockDto,
  UpsertSettingDto,
} from './content.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private service: ContentService) {}

  // Public
  @Get('blocks')
  getBlocks(@Query('keys') keys?: string) {
    return this.service.getBlocks(keys ? keys.split(',') : undefined);
  }

  @Get('blocks/:key')
  getBlock(@Param('key') key: string) {
    return this.service.getBlock(key);
  }

  @Get('faqs')
  getFaqs(@Query('category') category?: string) {
    return this.service.getFaqs(category);
  }

  @Get('testimonials')
  getTestimonials() {
    return this.service.getTestimonials();
  }

  @Get('settings')
  getSettings() {
    return this.service.getSettings();
  }

  @Get('settings/:key')
  getSetting(@Param('key') key: string) {
    return this.service.getSetting(key);
  }

  // CTA tracking (public, fire-and-forget)
  @Post('track-click')
  @HttpCode(204)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async trackClick(@Body() dto: TrackClickDto) {
    await this.service.trackClick(dto);
  }

  // Admin
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('blocks/:key')
  upsertBlock(@Param('key') key: string, @Body() dto: UpsertBlockDto) {
    return this.service.upsertBlock(key, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/faqs')
  getAllFaqs() {
    return this.service.getAllFaqs();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('faqs')
  createFaq(@Body() dto: CreateFaqDto) {
    return this.service.createFaq(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.service.updateFaq(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('faqs/:id')
  deleteFaq(@Param('id') id: string) {
    return this.service.deleteFaq(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/testimonials')
  getAllTestimonials() {
    return this.service.getAllTestimonials();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('testimonials')
  createTestimonial(@Body() dto: CreateTestimonialDto) {
    return this.service.createTestimonial(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('testimonials/:id')
  updateTestimonial(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.service.updateTestimonial(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('testimonials/:id')
  deleteTestimonial(@Param('id') id: string) {
    return this.service.deleteTestimonial(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('settings')
  upsertSettings(@Body() dto: BulkSettingsDto) {
    return this.service.upsertSettings(dto.values);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('settings/:key')
  upsertSetting(@Param('key') key: string, @Body() dto: UpsertSettingDto) {
    return this.service.upsertSetting(key, dto.value, dto.label);
  }
}

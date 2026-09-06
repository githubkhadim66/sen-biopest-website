import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
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

  // CTA tracking (public)
  @Post('track-click')
  trackClick(@Body() data: { ctaType: string; page: string; productId?: string }) {
    return this.service.trackClick(data);
  }

  // Admin
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('blocks/:key')
  upsertBlock(@Param('key') key: string, @Body() data: { title?: string; content?: string; imageUrl?: string; linkUrl?: string; linkText?: string }) {
    return this.service.upsertBlock(key, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('faqs')
  createFaq(@Body() data: { question: string; answer: string; category?: string }) {
    return this.service.createFaq(data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() data: { question?: string; answer?: string; category?: string }) {
    return this.service.updateFaq(id, data);
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
  @Post('testimonials')
  createTestimonial(@Body() data: { authorName: string; authorRole?: string; content: string }) {
    return this.service.createTestimonial(data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('testimonials/:id')
  updateTestimonial(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.service.updateTestimonial(id, data);
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
  @Put('settings/:key')
  upsertSetting(@Param('key') key: string, @Body() data: { value: string; label?: string }) {
    return this.service.upsertSetting(key, data.value, data.label);
  }
}

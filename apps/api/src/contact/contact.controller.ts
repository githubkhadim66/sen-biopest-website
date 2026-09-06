import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService, CreateContactDto } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private service: ContactService) {}

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }
}

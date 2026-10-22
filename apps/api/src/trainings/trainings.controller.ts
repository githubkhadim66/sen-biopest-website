import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import {
  CreateTrainingDto,
  UpdateTrainingDto,
  CreateRegistrationDto,
  UpdateRegistrationStatusDto,
} from './trainings.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(private service: TrainingsService) {}

  // Public
  @Get()
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: CreateRegistrationDto) {
    return this.service.register(dto);
  }

  // Admin
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CONSEILLER')
  @Get('admin/list')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CONSEILLER')
  @Get('admin/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CONSEILLER')
  @Post('admin')
  create(@Body() dto: CreateTrainingDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CONSEILLER')
  @Put('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTrainingDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id/registrations')
  getRegistrations(@Param('id') id: string) {
    return this.service.getRegistrations(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/registrations/:id/status')
  updateRegistrationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    return this.service.updateRegistrationStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id/registrations/export')
  exportRegistrations(@Param('id') id: string) {
    return this.service.exportRegistrations(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommercialRequestsService } from './commercial-requests.service';
import {
  CreateCommercialRequestDto,
  UpdateCommercialRequestStatusDto,
  AddNoteDto,
} from './commercial-requests.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Commercial Requests')
@Controller('commercial-requests')
export class CommercialRequestsController {
  constructor(private service: CommercialRequestsService) {}

  // Public endpoint for form submission
  @Post()
  create(@Body() dto: CreateCommercialRequestDto) {
    return this.service.create(dto);
  }

  // Admin endpoints
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: PaginationDto & { status?: string; region?: string; type?: string }) {
    return this.service.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('export')
  export() {
    return this.service.export();
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
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommercialRequestStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.service.addNote(id, userId, dto);
  }
}

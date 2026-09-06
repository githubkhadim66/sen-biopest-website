import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TechnicalRequestsService } from './technical-requests.service';
import {
  CreateTechnicalRequestDto,
  UpdateTechnicalRequestStatusDto,
  AddTechnicalNoteDto,
} from './technical-requests.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Technical Requests')
@Controller('technical-requests')
export class TechnicalRequestsController {
  constructor(private service: TechnicalRequestsService) {}

  @Post()
  create(@Body() dto: CreateTechnicalRequestDto) {
    return this.service.create(dto);
  }

  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 5))
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photoData = files.map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.originalname,
    }));
    return this.service.addPhotos(id, photoData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: PaginationDto & { status?: string; region?: string }) {
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
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicalRequestStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddTechnicalNoteDto,
  ) {
    return this.service.addNote(id, userId, dto);
  }
}

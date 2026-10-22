import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageUploadOptions } from './multer.config';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @Post('single')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    const asset = await this.save(file);
    return { data: { url: asset.url } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadAdmin(@UploadedFile() file: Express.Multer.File) {
    const asset = await this.save(file);
    return { id: asset.id, url: asset.url };
  }

  private save(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    return this.prisma.mediaAsset.create({
      data: {
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }
}

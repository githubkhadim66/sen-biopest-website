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
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif)$/;

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    const asset = await this.save(file);
    return { data: { url: asset.url } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdmin(@UploadedFile() file: Express.Multer.File) {
    const asset = await this.save(file);
    return { id: asset.id, url: asset.url };
  }

  private save(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    if (!IMAGE_TYPES.test(file.mimetype)) {
      throw new BadRequestException('Seules les images sont acceptées');
    }
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

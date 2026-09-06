import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTechnicalRequestDto,
  UpdateTechnicalRequestStatusDto,
  AddTechnicalNoteDto,
} from './technical-requests.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class TechnicalRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTechnicalRequestDto) {
    return this.prisma.technicalRequest.create({ data: dto });
  }

  async addPhotos(id: string, files: Array<{ url: string; filename: string }>) {
    await this.findById(id);
    return this.prisma.technicalRequestPhoto.createMany({
      data: files.map((f) => ({ requestId: id, url: f.url, filename: f.filename })),
    });
  }

  async findAll(query: PaginationDto & { status?: string; region?: string }) {
    const { page = 1, limit = 20, search, status, region } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { crop: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (region) where.region = region;

    const [data, total] = await Promise.all([
      this.prisma.technicalRequest.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          photos: true,
          notes: {
            include: { author: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technicalRequest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const request = await this.prisma.technicalRequest.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        photos: true,
        notes: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!request) throw new NotFoundException('Demande technique introuvable');
    return request;
  }

  async updateStatus(id: string, dto: UpdateTechnicalRequestStatusDto) {
    await this.findById(id);
    return this.prisma.technicalRequest.update({
      where: { id },
      data: { status: dto.status, assignedToId: dto.assignedToId },
    });
  }

  async addNote(id: string, userId: string, dto: AddTechnicalNoteDto) {
    await this.findById(id);
    return this.prisma.technicalRequestNote.create({
      data: { requestId: id, authorId: userId, content: dto.content },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }
}

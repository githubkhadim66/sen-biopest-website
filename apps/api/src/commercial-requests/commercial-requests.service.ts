import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCommercialRequestDto,
  UpdateCommercialRequestStatusDto,
  AddNoteDto,
} from './commercial-requests.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CommercialRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommercialRequestDto) {
    return this.prisma.commercialRequest.create({ data: dto });
  }

  async findAll(query: PaginationDto & { status?: string; region?: string; type?: string }) {
    const { page = 1, limit = 20, search, status, region, type } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { productInterest: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (region) where.region = region;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.commercialRequest.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
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
      this.prisma.commercialRequest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const request = await this.prisma.commercialRequest.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        notes: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!request) throw new NotFoundException('Demande introuvable');
    return request;
  }

  async updateStatus(id: string, dto: UpdateCommercialRequestStatusDto) {
    await this.findById(id);
    return this.prisma.commercialRequest.update({
      where: { id },
      data: { status: dto.status, assignedToId: dto.assignedToId },
    });
  }

  async addNote(id: string, userId: string, dto: AddNoteDto) {
    await this.findById(id);
    return this.prisma.commercialRequestNote.create({
      data: { requestId: id, authorId: userId, content: dto.content },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  async export() {
    return this.prisma.commercialRequest.findMany({
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

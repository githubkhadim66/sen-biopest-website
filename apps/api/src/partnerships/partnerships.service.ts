import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePartnershipRequestDto,
  UpdatePartnershipStatusDto,
  AddPartnershipNoteDto,
} from './partnerships.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PartnershipsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePartnershipRequestDto) {
    return this.prisma.partnershipRequest.create({ data: dto });
  }

  async findAll(query: PaginationDto & { status?: string }) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { organizationName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.partnershipRequest.findMany({
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
      this.prisma.partnershipRequest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const request = await this.prisma.partnershipRequest.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        notes: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!request) throw new NotFoundException('Demande partenariat introuvable');
    return request;
  }

  async updateStatus(id: string, dto: UpdatePartnershipStatusDto) {
    await this.findById(id);
    return this.prisma.partnershipRequest.update({
      where: { id },
      data: { status: dto.status, assignedToId: dto.assignedToId },
    });
  }

  async addNote(id: string, userId: string, dto: AddPartnershipNoteDto) {
    await this.findById(id);
    return this.prisma.partnershipRequestNote.create({
      data: { requestId: id, authorId: userId, content: dto.content },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }
}

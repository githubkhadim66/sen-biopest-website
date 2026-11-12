import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCommercialRequestDto,
  UpdateCommercialRequestStatusDto,
  AddNoteDto,
  CommercialRequestQueryDto,
} from './commercial-requests.dto';
import { Prisma } from '@prisma/client';
import { paginate } from '../common/dto/pagination.dto';

import { MailService } from '../mail/mail.service';

const COMMERCIAL_LABELS: Record<string, string> = {
  DEVIS: 'Nouvelle demande de devis',
  COMMANDE: 'Nouvelle commande',
  RAPPEL: 'Demande de rappel',
  INFORMATION: "Demande d'information",
  ECHANTILLON: "Demande d'échantillon",
};
@Injectable()
export class CommercialRequestsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(dto: CreateCommercialRequestDto) {
    const request = await this.prisma.commercialRequest.create({ data: dto });
    const label = COMMERCIAL_LABELS[dto.type] ?? 'Nouvelle demande commerciale';
    this.mail.notify({
      subject: `${label} — ${dto.firstName} ${dto.lastName}`,
      intro: `${label} reçue depuis le site.`,
      fields: [
        ['Nom', `${dto.firstName} ${dto.lastName}`],
        ['Téléphone', dto.phone],
        ['E-mail', dto.email],
        ['Organisation', dto.organization],
        ['Localité', [dto.locality, dto.region].filter(Boolean).join(', ')],
        ['Produit(s)', dto.productInterest],
        ['Quantité', dto.quantity],
        ['Message', dto.message],
      ],
      adminPath: dto.type === 'COMMANDE' ? '/admin/commandes' : '/admin/demandes-commerciales',
      customerEmail: dto.email,
      customerMessage:
        dto.type === 'COMMANDE'
          ? 'Nous avons bien reçu votre commande. Un membre de notre équipe vous contacte rapidement pour confirmer la livraison et le paiement.'
          : undefined,
    });
    return request;
  }

  async findAll(query: CommercialRequestQueryDto) {
    const { page = 1, limit = 20, search, status, region, type } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.CommercialRequestWhereInput = {};

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
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.commercialRequest.count({ where }),
    ]);

    return paginate(data, total, page, limit);
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

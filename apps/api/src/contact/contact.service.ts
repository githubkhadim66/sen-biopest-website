import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

export class CreateContactDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(30)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  subject?: string;

  @IsString()
  @MaxLength(5000)
  message: string;

  @IsBoolean({ message: 'Veuillez accepter le traitement de vos données pour envoyer le formulaire' })
  consent: boolean;
}

export class ContactQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ obj, key }) => [true, 'true', '1'].includes(obj[key]))
  @IsBoolean()
  unread?: boolean;
}

import { MailService } from '../mail/mail.service';
@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(dto: CreateContactDto) {
    const message = await this.prisma.contactRequest.create({ data: dto });
    this.mail.notify({
      subject: `Nouveau message — ${dto.subject || dto.name}`,
      intro: 'Nouveau message reçu depuis le formulaire de contact.',
      fields: [
        ['Nom', dto.name],
        ['Téléphone', dto.phone],
        ['E-mail', dto.email],
        ['Sujet', dto.subject],
        ['Message', dto.message],
      ],
      adminPath: '/admin/messages',
      customerEmail: dto.email,
      customerMessage: 'Nous avons bien reçu votre message et nous vous répondrons dans les meilleurs délais.',
    });
    return message;
  }

  async findAll(query: ContactQueryDto) {
    const { page = 1, limit = 20, search, unread } = query;
    const where: Prisma.ContactRequestWhereInput = {};
    if (unread) where.isRead = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.contactRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactRequest.count({ where }),
      this.prisma.contactRequest.count({ where: { isRead: false } }),
    ]);

    return { ...paginate(data, total, page, limit), unreadCount };
  }

  async markRead(id: string, isRead = true) {
    await this.ensureExists(id);
    return this.prisma.contactRequest.update({ where: { id }, data: { isRead } });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    await this.prisma.contactRequest.delete({ where: { id } });
    return { message: 'Message supprimé' };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.contactRequest.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Message introuvable');
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;

  @IsBoolean()
  consent: boolean;
}

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    return this.prisma.contactRequest.create({ data: dto });
  }

  async findAll() {
    return this.prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async markRead(id: string) {
    return this.prisma.contactRequest.update({ where: { id }, data: { isRead: true } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrainingDto,
  UpdateTrainingDto,
  CreateRegistrationDto,
  UpdateRegistrationStatusDto,
} from './trainings.dto';
import slugify from 'slugify';

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic() {
    const trainings = await this.prisma.training.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { registrations: true } },
        documents: { select: { id: true, title: true, url: true } },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
    });
    return trainings.map((t) => ({
      ...t,
      registrationCount: t._count.registrations,
      _count: undefined,
    }));
  }

  async findBySlug(slug: string) {
    const training = await this.prisma.training.findUnique({
      where: { slug },
      include: {
        _count: { select: { registrations: true } },
        documents: { select: { id: true, title: true, url: true } },
      },
    });
    if (!training) throw new NotFoundException('Formation introuvable');
    return { ...training, registrationCount: training._count.registrations, _count: undefined };
  }

  async findAllAdmin() {
    return this.prisma.training.findMany({
      include: {
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        registrations: { orderBy: { createdAt: 'desc' } },
        documents: true,
      },
    });
    if (!training) throw new NotFoundException('Formation introuvable');
    return training;
  }

  async create(dto: CreateTrainingDto) {
    const slug = slugify(dto.title, { lower: true, strict: true });
    return this.prisma.training.create({
      data: {
        ...dto,
        slug,
        objectives: dto.objectives || [],
        date: dto.date ? new Date(dto.date) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async update(id: string, dto: UpdateTrainingDto) {
    await this.findById(id);
    return this.prisma.training.update({
      where: { id },
      data: {
        ...dto,
        slug: dto.title ? slugify(dto.title, { lower: true, strict: true }) : undefined,
        date: dto.date ? new Date(dto.date) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.training.delete({ where: { id } });
    return { message: 'Formation supprimée' };
  }

  // Registrations
  async register(dto: CreateRegistrationDto) {
    return this.prisma.trainingRegistration.create({ data: dto });
  }

  async getRegistrations(trainingId: string) {
    return this.prisma.trainingRegistration.findMany({
      where: { trainingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRegistrationStatus(id: string, dto: UpdateRegistrationStatusDto) {
    return this.prisma.trainingRegistration.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async exportRegistrations(trainingId: string) {
    return this.prisma.trainingRegistration.findMany({
      where: { trainingId },
      orderBy: { createdAt: 'asc' },
    });
  }
}

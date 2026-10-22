import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrainingDto,
  UpdateTrainingDto,
  CreateRegistrationDto,
  UpdateRegistrationStatusDto,
} from './trainings.dto';
import slugify from 'slugify';

const toSlug = (value: string) => slugify(value, { lower: true, strict: true }) || 'formation';

// Cancelled registrations free their seat
const activeRegistrations = { where: { status: { not: 'ANNULE' as const } } };

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic() {
    const trainings = await this.prisma.training.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { registrations: activeRegistrations } },
        documents: { select: { id: true, title: true, url: true } },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
    });
    // Upcoming (or undated) sessions first, past ones after, most recent first
    const now = Date.now();
    const isPast = (d: Date | null) => !!d && d.getTime() < now;
    const upcoming = trainings.filter((t) => !isPast(t.date));
    const past = trainings.filter((t) => isPast(t.date)).reverse();
    return [...upcoming, ...past].map(({ _count, ...t }) => ({ ...t, registrationCount: _count.registrations }));
  }

  async findBySlug(slug: string) {
    const training = await this.prisma.training.findFirst({
      where: { slug, isPublished: true },
      include: {
        _count: { select: { registrations: activeRegistrations } },
        documents: { select: { id: true, title: true, url: true } },
      },
    });
    if (!training) throw new NotFoundException('Formation introuvable');
    const { _count, ...rest } = training;
    return { ...rest, registrationCount: _count.registrations };
  }

  async findAllAdmin() {
    return this.prisma.training.findMany({
      include: { registrations: { orderBy: { createdAt: 'desc' } } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
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
    return this.prisma.training.create({
      data: {
        ...dto,
        slug: await this.uniqueSlug(dto.title),
        objectives: dto.objectives || [],
        date: dto.date ? new Date(dto.date) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async update(id: string, dto: UpdateTrainingDto) {
    const existing = await this.findById(id);
    return this.prisma.training.update({
      where: { id },
      data: {
        ...dto,
        slug: dto.title && dto.title !== existing.title ? await this.uniqueSlug(dto.title, id) : undefined,
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
    const training = await this.prisma.training.findFirst({
      where: { id: dto.trainingId, isPublished: true },
      include: { _count: { select: { registrations: activeRegistrations } } },
    });
    if (!training) throw new NotFoundException('Formation introuvable');

    if (training.date && training.date < new Date()) {
      throw new BadRequestException('Les inscriptions à cette formation sont closes');
    }
    if (training.maxParticipants && training._count.registrations >= training.maxParticipants) {
      throw new BadRequestException('Cette formation est complète');
    }

    const duplicate = await this.prisma.trainingRegistration.findFirst({
      where: { trainingId: dto.trainingId, phone: dto.phone, status: { not: 'ANNULE' } },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException('Vous êtes déjà inscrit(e) à cette formation avec ce numéro');
    }

    return this.prisma.trainingRegistration.create({ data: dto });
  }

  async getRegistrations(trainingId: string) {
    return this.prisma.trainingRegistration.findMany({
      where: { trainingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRegistrationStatus(id: string, dto: UpdateRegistrationStatusDto) {
    const registration = await this.prisma.trainingRegistration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundException('Inscription introuvable');
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

  private async uniqueSlug(title: string, excludeId?: string) {
    const base = toSlug(title);
    const taken = await this.prisma.training.findMany({
      where: { slug: { startsWith: base }, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { slug: true },
    });
    const slugs = new Set(taken.map((t) => t.slug));
    if (!slugs.has(base)) return base;
    let n = 2;
    while (slugs.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }
}

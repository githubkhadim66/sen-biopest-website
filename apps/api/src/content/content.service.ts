import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFaqDto,
  CreateTestimonialDto,
  TrackClickDto,
  UpdateFaqDto,
  UpdateTestimonialDto,
  UpsertBlockDto,
} from './content.dto';

/** Settings editable from the back-office (anything else is rejected) */
export const EDITABLE_SETTINGS: Record<string, string> = {
  whatsapp_number: 'Numéro WhatsApp',
  company_phone: 'Téléphone',
  company_email: 'Email',
  company_address: 'Adresse',
};

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // Content Blocks
  async getBlocks(keys?: string[]) {
    return this.prisma.contentBlock.findMany({
      where: { isActive: true, ...(keys?.length ? { key: { in: keys } } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getBlock(key: string) {
    const block = await this.prisma.contentBlock.findUnique({ where: { key } });
    if (!block) throw new NotFoundException('Bloc introuvable');
    return block;
  }

  async upsertBlock(key: string, dto: UpsertBlockDto) {
    return this.prisma.contentBlock.upsert({
      where: { key },
      update: dto,
      create: { key, ...dto },
    });
  }

  // FAQ
  async getFaqs(category?: string) {
    return this.prisma.faq.findMany({
      where: { isActive: true, ...(category ? { category } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAllFaqs() {
    return this.prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createFaq(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    await this.ensureFaq(id);
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: string) {
    await this.ensureFaq(id);
    await this.prisma.faq.delete({ where: { id } });
    return { message: 'FAQ supprimée' };
  }

  // Testimonials
  async getTestimonials() {
    return this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAllTestimonials() {
    return this.prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createTestimonial(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({ data: dto });
  }

  async updateTestimonial(id: string, dto: UpdateTestimonialDto) {
    await this.ensureTestimonial(id);
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async deleteTestimonial(id: string) {
    await this.ensureTestimonial(id);
    await this.prisma.testimonial.delete({ where: { id } });
    return { message: 'Témoignage supprimé' };
  }

  // Settings
  async getSettings() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async getSetting(key: string) {
    const setting = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException('Paramètre introuvable');
    return setting;
  }

  async upsertSetting(key: string, value: string, label?: string) {
    if (!(key in EDITABLE_SETTINGS)) throw new BadRequestException(`Paramètre inconnu : ${key}`);
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, label: label ?? EDITABLE_SETTINGS[key] },
    });
  }

  async upsertSettings(values: Record<string, string>) {
    const entries = Object.entries(values);
    const unknown = entries.filter(([key]) => !(key in EDITABLE_SETTINGS)).map(([key]) => key);
    if (unknown.length) throw new BadRequestException(`Paramètres inconnus : ${unknown.join(', ')}`);
    if (entries.some(([, v]) => typeof v !== 'string' || v.length > 1000)) {
      throw new BadRequestException('Valeurs de paramètres invalides');
    }

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.siteSetting.upsert({
          where: { key },
          update: { value: value.trim() },
          create: { key, value: value.trim(), label: EDITABLE_SETTINGS[key] },
        }),
      ),
    );
    return this.getSettings();
  }

  // CTA Click tracking
  async trackClick(dto: TrackClickDto) {
    const { productSlug, ...data } = dto;
    await this.prisma.ctaClick.create({
      data: { ...data, metadata: productSlug ? { productSlug } : undefined },
    });
  }

  private async ensureFaq(id: string) {
    const found = await this.prisma.faq.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('FAQ introuvable');
  }

  private async ensureTestimonial(id: string) {
    const found = await this.prisma.testimonial.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Témoignage introuvable');
  }
}

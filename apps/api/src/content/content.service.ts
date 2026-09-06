import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // Content Blocks
  async getBlocks(keys?: string[]) {
    if (keys?.length) {
      return this.prisma.contentBlock.findMany({
        where: { key: { in: keys }, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    }
    return this.prisma.contentBlock.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getBlock(key: string) {
    return this.prisma.contentBlock.findUnique({ where: { key } });
  }

  async upsertBlock(key: string, data: { title?: string; content?: string; imageUrl?: string; linkUrl?: string; linkText?: string; metadata?: Record<string, unknown> }) {
    return this.prisma.contentBlock.upsert({
      where: { key },
      update: data as any,
      create: { key, ...data } as any,
    });
  }

  // FAQ
  async getFaqs(category?: string) {
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    return this.prisma.faq.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async createFaq(data: { question: string; answer: string; category?: string }) {
    return this.prisma.faq.create({ data });
  }

  async updateFaq(id: string, data: { question?: string; answer?: string; category?: string; isActive?: boolean; sortOrder?: number }) {
    return this.prisma.faq.update({ where: { id }, data });
  }

  async deleteFaq(id: string) {
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

  async createTestimonial(data: { authorName: string; authorRole?: string; authorLocation?: string; content: string; imageUrl?: string; rating?: number }) {
    return this.prisma.testimonial.create({ data });
  }

  async updateTestimonial(id: string, data: Record<string, unknown>) {
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  async deleteTestimonial(id: string) {
    await this.prisma.testimonial.delete({ where: { id } });
    return { message: 'Témoignage supprimé' };
  }

  // Settings
  async getSettings() {
    return this.prisma.siteSetting.findMany();
  }

  async getSetting(key: string) {
    return this.prisma.siteSetting.findUnique({ where: { key } });
  }

  async upsertSetting(key: string, value: string, label?: string) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, label },
    });
  }

  // CTA Click tracking
  async trackClick(data: { ctaType: string; page: string; productId?: string; metadata?: Record<string, unknown> }) {
    return this.prisma.ctaClick.create({ data: data as any });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      commercialTotal,
      commercialThisMonth,
      commercialByStatus,
      technicalTotal,
      technicalThisMonth,
      technicalByStatus,
      trainingRegTotal,
      trainingRegThisMonth,
      partnershipTotal,
      partnershipThisMonth,
      whatsappClicks,
      devisClicks,
      totalClicks,
      recentCommercial,
      recentTechnical,
      requestsByRegion,
      ordersTotal,
      ordersThisMonth,
      ordersNew,
      recentOrders,
    ] = await Promise.all([
      this.prisma.commercialRequest.count(),
      this.prisma.commercialRequest.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.commercialRequest.groupBy({ by: ['status'], _count: true }),
      this.prisma.technicalRequest.count(),
      this.prisma.technicalRequest.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.technicalRequest.groupBy({ by: ['status'], _count: true }),
      this.prisma.trainingRegistration.count(),
      this.prisma.trainingRegistration.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.partnershipRequest.count(),
      this.prisma.partnershipRequest.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.ctaClick.count({ where: { ctaType: 'whatsapp' } }),
      this.prisma.ctaClick.count({ where: { ctaType: 'devis' } }),
      this.prisma.ctaClick.count(),
      this.prisma.commercialRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, type: true, status: true, createdAt: true },
      }),
      this.prisma.technicalRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, crop: true, status: true, createdAt: true },
      }),
      this.prisma.commercialRequest.groupBy({ by: ['region'], _count: true, where: { region: { not: null } } }),
      this.prisma.commercialRequest.count({ where: { type: 'COMMANDE' } }),
      this.prisma.commercialRequest.count({ where: { type: 'COMMANDE', createdAt: { gte: startOfMonth } } }),
      this.prisma.commercialRequest.count({ where: { type: 'COMMANDE', status: 'NOUVEAU' } }),
      this.prisma.commercialRequest.findMany({
        where: { type: 'COMMANDE' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, phone: true,
          productInterest: true, quantity: true, status: true, region: true,
          createdAt: true,
        },
      }),
    ]);

    const commercialStatusMap: Record<string, number> = {};
    commercialByStatus.forEach((s) => { commercialStatusMap[s.status] = s._count; });

    const technicalStatusMap: Record<string, number> = {};
    technicalByStatus.forEach((s) => { technicalStatusMap[s.status] = s._count; });

    return {
      commercialRequests: {
        total: commercialTotal,
        byStatus: commercialStatusMap,
        thisMonth: commercialThisMonth,
        converted: commercialStatusMap['CONVERTI'] || 0,
      },
      technicalRequests: {
        total: technicalTotal,
        byStatus: technicalStatusMap,
        thisMonth: technicalThisMonth,
      },
      trainingRegistrations: {
        total: trainingRegTotal,
        thisMonth: trainingRegThisMonth,
      },
      partnershipRequests: {
        total: partnershipTotal,
        thisMonth: partnershipThisMonth,
      },
      ctaClicks: {
        whatsapp: whatsappClicks,
        devis: devisClicks,
        total: totalClicks,
      },
      recentRequests: [
        ...recentCommercial.map((r) => ({
          id: r.id,
          type: 'commercial',
          name: `${r.firstName} ${r.lastName}`,
          date: r.createdAt.toISOString(),
          status: r.status,
        })),
        ...recentTechnical.map((r) => ({
          id: r.id,
          type: 'technical',
          name: `${r.firstName} ${r.lastName}`,
          date: r.createdAt.toISOString(),
          status: r.status,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
      requestsByRegion: requestsByRegion.map((r) => ({ region: r.region, count: r._count })),
      orders: {
        total: ordersTotal,
        thisMonth: ordersThisMonth,
        newOrders: ordersNew,
        recent: recentOrders.map((o) => ({
          id: o.id,
          name: `${o.firstName} ${o.lastName}`,
          phone: o.phone,
          products: o.productInterest,
          quantity: o.quantity,
          status: o.status,
          region: o.region,
          date: o.createdAt.toISOString(),
        })),
      },
    };
  }
}

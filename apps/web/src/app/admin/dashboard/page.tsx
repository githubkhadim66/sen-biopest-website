'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Wrench,
  GraduationCap,
  Handshake,
  MousePointerClick,
  MapPin,
  ShoppingCart,
  RefreshCw,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatDate, statusLabel, statusColor, getWhatsAppUrl, WHATSAPP_NUMBER } from '@/lib/utils';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RecentOrder {
  id: string;
  name: string;
  phone: string;
  products: string | null;
  quantity: string | null;
  status: string;
  region: string | null;
  date: string;
}

interface DashboardStats {
  commercialRequests: {
    total: number;
    thisMonth: number;
    converted: number;
    byStatus: Record<string, number>;
  };
  technicalRequests: {
    total: number;
    thisMonth: number;
    byStatus: Record<string, number>;
  };
  trainingRegistrations: {
    total: number;
    thisMonth: number;
  };
  partnershipRequests: {
    total: number;
    thisMonth: number;
  };
  ctaClicks: {
    whatsapp: number;
    devis: number;
    total: number;
  };
  recentRequests: Array<{
    id: string;
    type: string;
    name: string;
    company?: string;
    status: string;
    date: string;
    region?: string;
  }>;
  requestsByRegion: Array<{
    region: string;
    count: number;
  }>;
  orders: {
    total: number;
    thisMonth: number;
    newOrders: number;
    recent: RecentOrder[];
  };
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, bgColor, href }: StatCardProps) {
  const content = (
    <Card className={href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-lg', bgColor)}>
            <Icon className={cn('h-6 w-6', color)} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<DashboardStats>('/dashboard/stats');
      setStats(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCards: StatCardProps[] = [
    {
      title: 'Commandes',
      value: stats.orders?.total || 0,
      icon: ShoppingCart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/admin/commandes',
    },
    {
      title: 'Nouvelles commandes',
      value: stats.orders?.newOrders || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/admin/commandes',
    },
    {
      title: 'Demandes commerciales',
      value: stats.commercialRequests.total,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/demandes-commerciales',
    },
    {
      title: 'Ce mois-ci',
      value: stats.commercialRequests.thisMonth,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Converties',
      value: stats.commercialRequests.converted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Demandes techniques',
      value: stats.technicalRequests.total,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Inscriptions formations',
      value: stats.trainingRegistrations.total,
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Clics WhatsApp',
      value: stats.ctaClicks.whatsapp,
      icon: MousePointerClick,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de l&apos;activite — actualise toutes les 30s</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="h-4 w-4" /> Actualiser
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
                Dernieres commandes
                {(stats.orders?.newOrders || 0) > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                    {stats.orders.newOrders}
                  </span>
                )}
              </h2>
              <Link href="/admin/commandes">
                <Button variant="ghost" size="sm">
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Client</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Produits</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Statut</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {stats.orders?.recent?.map((order) => (
                  <tr key={order.id} className={cn(
                    'border-b border-gray-50 hover:bg-gray-50',
                    order.status === 'NOUVEAU' && 'bg-blue-50/50',
                  )}>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{order.name}</p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[180px] truncate">
                      {order.products || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor(order.status))}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(order.date)}</td>
                    <td className="px-5 py-3">
                      <a
                        href={getWhatsAppUrl(order.phone, `Bonjour ${order.name}, votre commande Sen Biopest a ete recue. Nous vous confirmons le traitement.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="whatsapp" title="Confirmer via WhatsApp">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))}
                {(!stats.orders?.recent || stats.orders.recent.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      Aucune commande
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Requests by region */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Par région</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {stats.requestsByRegion.map((region) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{region.region}</span>
                  </div>
                  <Badge>{region.count}</Badge>
                </div>
              ))}
              {stats.requestsByRegion.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucune donnee</p>
              )}
            </CardBody>
          </Card>

          {/* Recent requests (all types) */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Demandes recentes</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {stats.recentRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.name}</p>
                    <p className="text-xs text-gray-500">{req.type} - {formatDate(req.date)}</p>
                  </div>
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor(req.status))}>
                    {statusLabel(req.status)}
                  </span>
                </div>
              ))}
              {stats.recentRequests.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucune demande</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

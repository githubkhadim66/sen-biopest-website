'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, statusLabel, statusColor, getWhatsAppUrl, WHATSAPP_NUMBER } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardHeader } from '@/components/ui/card';
import { NotesPanel } from '@/components/admin/notes-panel';
import { useDebouncedValue, type Note } from '@/lib/admin';
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  ShoppingCart,
  RefreshCw,
  Phone,
  Package,
  MapPin,
  User,
} from 'lucide-react';

interface OrderRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  type: string;
  status: string;
  actorType: string;
  region: string | null;
  locality: string | null;
  productInterest: string | null;
  quantity: string | null;
  cropConcerned: string | null;
  message: string | null;
  source: string | null;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  notes: Array<{ id: string; content: string; createdAt: string; author: { firstName: string; lastName: string } }>;
  createdAt: string;
}

interface OrdersResponse {
  data: OrderRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'NOUVEAU', label: 'Nouveau' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'RELANCE', label: 'Relance' },
  { value: 'CONVERTI', label: 'Converti' },
  { value: 'ANNULE', label: 'Annule' },
];

const ACTOR_LABELS: Record<string, string> = {
  PRODUCTEUR: 'Producteur',
  COOPERATIVE: 'Cooperative',
  GIE: 'GIE',
  JARDINIER: 'Jardinier',
  INSTITUTION: 'Institution',
  ENTREPRISE: 'Entreprise',
  PARTICULIER: 'Particulier',
  AUTRE: 'Autre',
};

function exportCSV(data: OrderRequest[], filename: string) {
  const headers = ['Nom', 'Telephone', 'Email', 'Profil', 'Produits', 'Quantite', 'Region', 'Statut', 'Date'];
  const rows = data.map((r) => [
    `${r.firstName} ${r.lastName}`,
    r.phone,
    r.email || '',
    ACTOR_LABELS[r.actorType] || r.actorType,
    r.productInterest || '',
    r.quantity || '',
    r.region || '',
    statusLabel(r.status),
    formatDate(r.createdAt),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const fetchOrders = useCallback(async () => {
    try {
      setError('');
      const params = new URLSearchParams({ type: 'COMMANDE', limit: '100' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      const data = await api.get<OrdersResponse>(`/commercial-requests?${params}`);
      setOrders(data.data || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await api.put(`/commercial-requests/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour');
    }
  }

  async function handleAddNote(id: string, content: string) {
    try {
      const note = await api.post<Note>(`/commercial-requests/${id}/notes`, { content });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, notes: [note, ...o.notes] } : o)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la note");
    }
  }

  function getWhatsAppConfirmUrl(order: OrderRequest) {
    const msg = `Bonjour ${order.firstName} ${order.lastName}, votre commande chez Sen Biopest a bien ete recue !\n\nProduits: ${order.productInterest || 'N/A'}\nQuantite: ${order.quantity || 'N/A'}\n\nNous allons traiter votre commande. Merci pour votre confiance !`;
    return getWhatsAppUrl(order.phone, msg);
  }

  const newOrdersCount = orders.filter((o) => o.status === 'NOUVEAU').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Commandes
            {newOrdersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                {newOrdersCount} nouvelle{newOrdersCount > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} commande{total > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(orders, 'commandes')}>
            <Download className="h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, telephone, produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-48"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              {search || statusFilter ? 'Aucune commande trouvee pour ces criteres.' : 'Aucune commande pour le moment.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 w-8"></th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Produits</th>
                  <th className="px-5 py-3">Qte</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Region</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <Fragment key={order.id}>
                    <tr
                      className={cn(
                        'hover:bg-gray-50 cursor-pointer',
                        order.status === 'NOUVEAU' && 'bg-blue-50/50',
                      )}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <td className="px-5 py-3">
                        {expandedId === order.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-900 whitespace-nowrap">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate" title={order.productInterest || ''}>
                        {order.productInterest || '-'}
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{order.quantity || '-'}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor(order.status))}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{order.region || '-'}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={getWhatsAppConfirmUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Valider via WhatsApp"
                        >
                          <Button size="sm" variant="whatsapp">
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </a>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={8} className="px-5 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                            {/* Client info */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Informations client</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{order.firstName} {order.lastName}</span>
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{ACTOR_LABELS[order.actorType] || order.actorType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{order.phone}</span>
                                </div>
                                {order.email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-xs">Email: {order.email}</span>
                                  </div>
                                )}
                                {order.region && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{order.locality ? `${order.locality}, ` : ''}{order.region}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Order info */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details commande</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <span>{order.productInterest || 'Non precise'}</span>
                                </div>
                                {order.quantity && (
                                  <p className="text-gray-600">Quantite: {order.quantity}</p>
                                )}
                                {order.cropConcerned && (
                                  <p className="text-gray-600">Cultures: {order.cropConcerned}</p>
                                )}
                                {order.message && (
                                  <div className="bg-white border border-gray-200 rounded p-3 text-gray-700 whitespace-pre-wrap">
                                    {order.message}
                                  </div>
                                )}
                                {order.source && (
                                  <p className="text-xs text-gray-400">Source: {order.source}</p>
                                )}
                              </div>
                            </div>

                            {/* Status update */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Changer le statut</h4>
                              <Select
                                options={STATUS_OPTIONS.filter((o) => o.value !== '')}
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="w-48"
                              />
                            </div>

                            {/* WhatsApp actions */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions WhatsApp</h4>
                              <div className="flex gap-2">
                                <a href={getWhatsAppConfirmUrl(order)} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="whatsapp">
                                    <MessageCircle className="h-4 w-4" /> Confirmer commande
                                  </Button>
                                </a>
                                <a
                                  href={getWhatsAppUrl(order.phone, `Bonjour ${order.firstName}, concernant votre commande Sen Biopest...`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline">
                                    <Phone className="h-4 w-4" /> Contacter
                                  </Button>
                                </a>
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2 space-y-2">
                              <NotesPanel notes={order.notes} onAdd={(content) => handleAddNote(order.id, content)} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

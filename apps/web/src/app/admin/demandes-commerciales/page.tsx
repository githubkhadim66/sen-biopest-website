'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, statusLabel, statusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardHeader } from '@/components/ui/card';
import { Search, Download, ChevronDown, ChevronUp, Loader2, MessageSquare } from 'lucide-react';

interface CommercialRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  type: string;
  status: string;
  actorType: string;
  region: string | null;
  productInterest: string | null;
  message: string | null;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  notes: Array<{ id: string; content: string; createdAt: string; author: { firstName: string; lastName: string } }>;
  createdAt: string;
}

interface ResponseData {
  data: CommercialRequest[];
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

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'DEVIS', label: 'Devis' },
  { value: 'COMMANDE', label: 'Commande' },
  { value: 'RAPPEL', label: 'Rappel' },
  { value: 'INFORMATION', label: 'Information' },
  { value: 'ECHANTILLON', label: 'Echantillon' },
];

function exportCSV(data: CommercialRequest[], filename: string) {
  const headers = ['Nom', 'Email', 'Telephone', 'Type', 'Statut', 'Region', 'Assigne a', 'Date'];
  const rows = data.map((r) => [
    `${r.firstName} ${r.lastName}`,
    r.email || '',
    r.phone,
    r.type,
    statusLabel(r.status),
    r.region || '',
    r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : '',
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

export default function DemandesCommercialesPage() {
  const [requests, setRequests] = useState<CommercialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const data = await api.get<ResponseData>(`/commercial-requests?${params}`);
      setRequests(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await api.put(`/commercial-requests/${id}/status`, { status: newStatus });
      fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour');
    }
  }

  async function handleAddNote(id: string) {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await api.post(`/commercial-requests/${id}/notes`, { content: noteText });
      setNoteText('');
      fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Demandes commerciales</h1>
        <Button variant="outline" onClick={() => exportCSV(requests, 'demandes-commerciales')}>
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
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
                placeholder="Rechercher par nom, email, telephone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Select
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="sm:w-44"
            />
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-44"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {search || statusFilter || typeFilter ? 'Aucune demande trouvee pour ces criteres.' : 'Aucune demande commerciale.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 w-8"></th>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Region</th>
                  <th className="px-5 py-3">Assigne a</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <>
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      <td className="px-5 py-3">
                        {expandedId === req.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{req.firstName} {req.lastName}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{req.type}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor(req.status))}>
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{req.region || '-'}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        {req.assignedTo ? `${req.assignedTo.firstName} ${req.assignedTo.lastName}` : '-'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                    </tr>
                    {expandedId === req.id && (
                      <tr key={`${req.id}-detail`}>
                        <td colSpan={7} className="px-5 py-4 bg-gray-50">
                          <div className="space-y-4 max-w-2xl">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact</p>
                              <p className="text-sm">{req.email || 'Pas d\'email'} &middot; {req.phone}</p>
                            </div>
                            {req.productInterest && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Produits</p>
                                <p className="text-sm text-gray-700">{req.productInterest}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Message</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.message || 'Aucun message'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Changer le statut</p>
                              <Select
                                options={STATUS_OPTIONS.filter((o) => o.value !== '')}
                                value={req.status}
                                onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                className="w-48"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                Notes ({req.notes?.length || 0})
                              </p>
                              {req.notes && req.notes.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {req.notes.map((note) => (
                                    <div key={note.id} className="bg-white border border-gray-200 rounded p-2 text-sm">
                                      <p>{note.content}</p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {note.author.firstName} {note.author.lastName} - {formatDate(note.createdAt)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Ajouter une note..."
                                  value={expandedId === req.id ? noteText : ''}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote(req.id)}
                                />
                                <Button size="sm" onClick={() => handleAddNote(req.id)} disabled={savingNote}>
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, statusLabel, statusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Download, ChevronDown, ChevronUp, Loader2, MessageSquare, Image as ImageIcon } from 'lucide-react';

interface TechnicalRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  crop: string;
  symptoms: string;
  description: string;
  status: string;
  region: string;
  photos: string[];
  notes: string[];
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'NOUVEAU', label: 'Nouveau' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TRAITE', label: 'Traité' },
  { value: 'CLOTURE', label: 'Clôturé' },
];

function exportCSV(data: TechnicalRequest[], filename: string) {
  const headers = ['Nom', 'Email', 'Téléphone', 'Culture', 'Symptômes', 'Statut', 'Région', 'Photos', 'Date'];
  const rows = data.map((r) => [
    r.fullName,
    r.email,
    r.phone,
    r.crop,
    r.symptoms,
    statusLabel(r.status),
    r.region,
    r.photos?.length || 0,
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

export default function DemandesTechniquesPage() {
  const [requests, setRequests] = useState<TechnicalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get<{ requests: TechnicalRequest[] }>('/technical-requests');
      setRequests(data.requests || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.crop.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await api.put(`/technical-requests/${id}`, { status: newStatus });
      fetchRequests();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleAddNote(id: string) {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await api.post(`/technical-requests/${id}/notes`, { content: noteText });
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
        <h1 className="text-2xl font-bold text-gray-900">Demandes techniques</h1>
        <Button variant="outline" onClick={() => exportCSV(filtered, 'demandes-techniques')}>
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
                placeholder="Rechercher par nom, culture, région..."
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {search || statusFilter ? 'Aucune demande trouvée.' : 'Aucune demande technique.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 w-8"></th>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Culture</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Région</th>
                  <th className="px-5 py-3 text-center">Photos</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((req) => (
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
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{req.fullName}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{req.crop}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor(req.status))}>
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{req.region}</td>
                      <td className="px-5 py-3 text-center">
                        {req.photos && req.photos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-primary-600">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {req.photos.length}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                    </tr>
                    {expandedId === req.id && (
                      <tr key={`${req.id}-detail`}>
                        <td colSpan={7} className="px-5 py-4 bg-gray-50">
                          <div className="space-y-4 max-w-3xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact</p>
                                <p className="text-sm">{req.email} &middot; {req.phone}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Symptômes</p>
                                <p className="text-sm text-gray-700">{req.symptoms || 'Non précisé'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.description || 'Aucune description'}</p>
                            </div>
                            {req.photos && req.photos.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Photos</p>
                                <div className="flex flex-wrap gap-2">
                                  {req.photos.map((photo, i) => (
                                    <a
                                      key={i}
                                      href={photo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-primary-400 transition-colors"
                                    >
                                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
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
                                  {req.notes.map((note, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded p-2 text-sm">
                                      {typeof note === 'string' ? note : JSON.stringify(note)}
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
                                <Button size="sm" onClick={() => handleAddNote(req.id)} loading={savingNote}>
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

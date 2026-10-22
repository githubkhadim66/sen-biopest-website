'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, statusLabel, statusColor, getWhatsAppUrl } from '@/lib/utils';
import { ACTOR_LABELS, exportCSV, useDebouncedValue, type Note, type Paginated } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardHeader } from '@/components/ui/card';
import { NotesPanel } from '@/components/admin/notes-panel';
import { ErrorAlert } from '@/components/admin/alerts';
import { Search, Download, ChevronDown, ChevronUp, Loader2, MessageCircle } from 'lucide-react';

interface TechnicalRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  organization: string | null;
  actorType: string;
  locality: string | null;
  region: string | null;
  crop: string;
  cropStage: string | null;
  symptoms: string;
  description: string | null;
  status: string;
  photos: { id: string; url: string; filename: string }[];
  notes: Note[];
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'NOUVEAU', label: 'Nouveau' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TRAITE', label: 'Traité' },
  { value: 'CLOTURE', label: 'Clôturé' },
];

export default function DemandesTechniquesPage() {
  const [requests, setRequests] = useState<TechnicalRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const fetchRequests = useCallback(async () => {
    try {
      setError('');
      const params = new URLSearchParams({ limit: '100' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<Paginated<TechnicalRequest>>(`/technical-requests?${params}`);
      setRequests(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await api.put(`/technical-requests/${id}/status`, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleAddNote(id: string, content: string) {
    try {
      const note = await api.post<Note>(`/technical-requests/${id}/notes`, { content });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, notes: [note, ...r.notes] } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la note");
    }
  }

  function handleExport() {
    exportCSV(
      ['Nom', 'Téléphone', 'Email', 'Profil', 'Culture', 'Stade', 'Symptômes', 'Région', 'Localité', 'Photos', 'Statut', 'Date'],
      requests.map((r) => [
        `${r.firstName} ${r.lastName}`,
        r.phone,
        r.email,
        ACTOR_LABELS[r.actorType] || r.actorType,
        r.crop,
        r.cropStage,
        r.symptoms,
        r.region,
        r.locality,
        r.photos.length,
        statusLabel(r.status),
        formatDate(r.createdAt),
      ]),
      'demandes-techniques',
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes techniques</h1>
          <p className="text-sm text-gray-500">{total} demande{total > 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={requests.length === 0}>
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher par nom, téléphone, culture, région..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
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
              {search || statusFilter ? 'Aucune demande pour ces critères.' : 'Aucune demande technique.'}
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
                  <th className="px-5 py-3">Photos</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <Fragment key={req.id}>
                    <tr
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
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {req.firstName} {req.lastName}
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{req.crop}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor(req.status))}>
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{req.region || '-'}</td>
                      <td className="px-5 py-3 text-gray-600">{req.photos.length}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                    </tr>
                    {expandedId === req.id && (
                      <tr>
                        <td colSpan={7} className="px-5 py-4 bg-gray-50">
                          <div className="grid gap-4 lg:grid-cols-2 max-w-5xl">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact</p>
                                <p className="text-sm">
                                  {req.phone} · {req.email || "Pas d'email"}
                                  <br />
                                  {ACTOR_LABELS[req.actorType] || req.actorType}
                                  {req.organization ? ` · ${req.organization}` : ''}
                                  {req.locality ? ` · ${req.locality}` : ''}
                                </p>
                                <a
                                  href={getWhatsAppUrl(req.phone, `Bonjour ${req.firstName}, Sen Biopest revient vers vous au sujet de votre demande d'accompagnement (${req.crop}).`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-green-700 hover:underline mt-1"
                                >
                                  <MessageCircle className="h-4 w-4" /> Répondre sur WhatsApp
                                </a>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Culture</p>
                                <p className="text-sm text-gray-700">
                                  {req.crop}
                                  {req.cropStage ? ` · stade : ${req.cropStage}` : ''}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Symptômes</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.symptoms}</p>
                              </div>
                              {req.description && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.description}</p>
                                </div>
                              )}
                              {req.photos.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Photos</p>
                                  <div className="flex flex-wrap gap-2">
                                    {req.photos.map((photo) => (
                                      <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={photo.url}
                                          alt={photo.filename}
                                          loading="lazy"
                                          className="h-24 w-24 object-cover rounded-lg border border-gray-200 hover:opacity-80"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Statut</p>
                                <Select
                                  options={STATUS_OPTIONS.filter((o) => o.value !== '')}
                                  value={req.status}
                                  onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                  className="w-48"
                                />
                              </div>
                              <NotesPanel notes={req.notes} onAdd={(content) => handleAddNote(req.id, content)} />
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

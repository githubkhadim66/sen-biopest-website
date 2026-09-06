'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, statusLabel, statusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Search, Download, Edit2, Trash2, ChevronDown, ChevronUp,
  Loader2, Users, X, Calendar, MapPin,
} from 'lucide-react';

interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  modality: string;
  maxParticipants: number;
  registrations: Registration[];
  published: boolean;
  createdAt: string;
}

const MODALITY_OPTIONS = [
  { value: 'PRESENTIEL', label: 'Présentiel' },
  { value: 'EN_LIGNE', label: 'En ligne' },
  { value: 'HYBRIDE', label: 'Hybride' },
];

const REGISTRATION_STATUS_OPTIONS = [
  { value: 'INSCRIT', label: 'Inscrit' },
  { value: 'CONFIRME', label: 'Confirmé' },
  { value: 'PRESENT', label: 'Présent' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'ANNULE', label: 'Annulé' },
];

function exportRegistrationsCSV(training: Training) {
  const headers = ['Nom', 'Email', 'Téléphone', 'Statut', 'Date inscription'];
  const rows = (training.registrations || []).map((r) => [
    r.fullName,
    r.email,
    r.phone,
    statusLabel(r.status),
    formatDate(r.createdAt),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscriptions-${training.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FormationsAdminPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    modality: 'PRESENTIEL',
    maxParticipants: 30,
    published: true,
  });

  const fetchTrainings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get<{ trainings: Training[] }>('/trainings/admin/list');
      setTrainings(data.trainings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  function openCreate() {
    setEditingTraining(null);
    setForm({ title: '', description: '', date: '', location: '', modality: 'PRESENTIEL', maxParticipants: 30, published: true });
    setShowForm(true);
  }

  function openEdit(training: Training) {
    setEditingTraining(training);
    setForm({
      title: training.title,
      description: training.description,
      date: training.date ? training.date.slice(0, 10) : '',
      location: training.location,
      modality: training.modality,
      maxParticipants: training.maxParticipants,
      published: training.published,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTraining) {
        await api.put(`/trainings/admin/${editingTraining.id}`, form);
      } else {
        await api.post('/trainings/admin', form);
      }
      setShowForm(false);
      fetchTrainings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(training: Training) {
    if (!confirm(`Supprimer la formation "${training.title}" ?`)) return;
    try {
      await api.delete(`/trainings/admin/${training.id}`);
      fetchTrainings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  async function handleRegistrationStatus(trainingId: string, registrationId: string, newStatus: string) {
    try {
      await api.put(`/trainings/admin/${trainingId}/registrations/${registrationId}`, { status: newStatus });
      fetchTrainings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Ajouter une formation
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTraining ? 'Modifier la formation' : 'Nouvelle formation'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Titre"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <Input
                  label="Lieu"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
                <Select
                  label="Modalité"
                  options={MODALITY_OPTIONS}
                  value={form.modality}
                  onChange={(e) => setForm({ ...form, modality: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Participants max"
                  type="number"
                  min={1}
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) || 0 })}
                />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Publié
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" loading={saving}>
                  {editingTraining ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : trainings.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500 text-sm">Aucune formation enregistrée.</div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {trainings.map((training) => (
            <Card key={training.id}>
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === training.id ? null : training.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 truncate">{training.title}</h3>
                    {!training.published && (
                      <Badge className="bg-gray-100 text-gray-600">Brouillon</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(training.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {training.location || training.modality}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {training.registrations?.length || 0} / {training.maxParticipants}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(training); }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(training); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {expandedId === training.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              {expandedId === training.id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Inscriptions ({training.registrations?.length || 0})
                    </h4>
                    {training.registrations && training.registrations.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportRegistrationsCSV(training)}
                      >
                        <Download className="h-3 w-3" />
                        Exporter
                      </Button>
                    )}
                  </div>
                  {!training.registrations || training.registrations.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune inscription.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-xs font-medium text-gray-500 uppercase">
                          <tr>
                            <th className="pb-2 pr-4">Nom</th>
                            <th className="pb-2 pr-4">Email</th>
                            <th className="pb-2 pr-4">Téléphone</th>
                            <th className="pb-2 pr-4">Statut</th>
                            <th className="pb-2 pr-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {training.registrations.map((reg) => (
                            <tr key={reg.id}>
                              <td className="py-2 pr-4 font-medium text-gray-900 whitespace-nowrap">{reg.fullName}</td>
                              <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{reg.email}</td>
                              <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{reg.phone}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">
                                <Select
                                  options={REGISTRATION_STATUS_OPTIONS}
                                  value={reg.status}
                                  onChange={(e) => handleRegistrationStatus(training.id, reg.id, e.target.value)}
                                  className="w-36 text-xs"
                                />
                              </td>
                              <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{formatDate(reg.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

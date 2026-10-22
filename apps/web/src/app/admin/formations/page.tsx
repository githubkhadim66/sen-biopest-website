'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate, statusLabel, getWhatsAppUrl } from '@/lib/utils';
import { ACTOR_LABELS, exportCSV } from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert, SuccessAlert } from '@/components/admin/alerts';
import {
  Plus, Download, Edit2, Trash2, ChevronDown, ChevronUp, Loader2, Users, X, Calendar, MapPin, ExternalLink,
} from 'lucide-react';

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  organization: string | null;
  actorType: string;
  region: string | null;
  motivation: string | null;
  status: string;
  createdAt: string;
}

interface Training {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  targetAudience: string;
  duration: string | null;
  modality: string;
  location: string | null;
  date: string | null;
  endDate: string | null;
  price: string | null;
  maxParticipants: number | null;
  isPublished: boolean;
  registrations: Registration[];
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

const EMPTY_FORM = {
  title: '',
  description: '',
  objectives: '',
  targetAudience: '',
  duration: '',
  modality: 'PRESENTIEL',
  location: '',
  date: '',
  endDate: '',
  price: '',
  maxParticipants: '30',
  isPublished: true,
};

type TrainingForm = typeof EMPTY_FORM;

const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : '');

const activeCount = (t: Training) => t.registrations.filter((r) => r.status !== 'ANNULE').length;

export default function FormationsAdminPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Training | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TrainingForm>(EMPTY_FORM);

  const set = <K extends keyof TrainingForm>(key: K, value: TrainingForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fetchTrainings = useCallback(async () => {
    try {
      setError('');
      setTrainings(await api.get<Training[]>('/trainings/admin/list'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(training: Training) {
    setEditing(training);
    setForm({
      title: training.title,
      description: training.description,
      objectives: training.objectives.join('\n'),
      targetAudience: training.targetAudience,
      duration: training.duration || '',
      modality: training.modality,
      location: training.location || '',
      date: toDateInput(training.date),
      endDate: toDateInput(training.endDate),
      price: training.price || '',
      maxParticipants: training.maxParticipants ? String(training.maxParticipants) : '',
      isPublished: training.isPublished,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.endDate && form.date && form.endDate < form.date) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      description: form.description,
      objectives: form.objectives.split('\n').map((o) => o.trim()).filter(Boolean),
      targetAudience: form.targetAudience,
      duration: form.duration,
      modality: form.modality,
      location: form.location,
      date: form.date || undefined,
      endDate: form.endDate || undefined,
      price: form.price,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      isPublished: form.isPublished,
    };
    try {
      if (editing) {
        await api.put(`/trainings/admin/${editing.id}`, payload);
        setSuccess('Formation mise à jour.');
      } else {
        await api.post('/trainings/admin', payload);
        setSuccess('Formation créée.');
      }
      setShowForm(false);
      fetchTrainings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(training: Training) {
    try {
      await api.put(`/trainings/admin/${training.id}`, { isPublished: !training.isPublished });
      setTrainings((prev) => prev.map((t) => (t.id === training.id ? { ...t, isPublished: !t.isPublished } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(training: Training) {
    const count = training.registrations.length;
    const warning = count ? ` Ses ${count} inscription(s) seront aussi supprimées.` : '';
    if (!confirm(`Supprimer la formation « ${training.title} » ?${warning}`)) return;
    try {
      await api.delete(`/trainings/admin/${training.id}`);
      setTrainings((prev) => prev.filter((t) => t.id !== training.id));
      setSuccess('Formation supprimée.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  async function handleRegistrationStatus(trainingId: string, registrationId: string, status: string) {
    try {
      await api.put(`/trainings/admin/registrations/${registrationId}/status`, { status });
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === trainingId
            ? { ...t, registrations: t.registrations.map((r) => (r.id === registrationId ? { ...r, status } : r)) }
            : t,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  function exportRegistrations(training: Training) {
    exportCSV(
      ['Prénom', 'Nom', 'Téléphone', 'Email', 'Profil', 'Organisation', 'Région', 'Motivation', 'Statut', 'Inscrit le'],
      training.registrations.map((r) => [
        r.firstName,
        r.lastName,
        r.phone,
        r.email,
        ACTOR_LABELS[r.actorType] || r.actorType,
        r.organization,
        r.region,
        r.motivation,
        statusLabel(r.status),
        formatDate(r.createdAt),
      ]),
      `inscriptions-${training.slug}`,
    );
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

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onDone={() => setSuccess('')} />

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier la formation' : 'Nouvelle formation'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="t-title" label="Titre" required value={form.title} onChange={(e) => set('title', e.target.value)} />
              <Textarea
                id="t-desc"
                label="Description"
                required
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
              <Textarea
                id="t-obj"
                label="Objectifs (un par ligne)"
                rows={3}
                value={form.objectives}
                onChange={(e) => set('objectives', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="t-audience"
                  label="Public cible"
                  required
                  placeholder="Producteurs maraîchers, coopératives..."
                  value={form.targetAudience}
                  onChange={(e) => set('targetAudience', e.target.value)}
                />
                <Input id="t-duration" label="Durée" placeholder="2 jours" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
                <Select
                  id="t-modality"
                  label="Modalité"
                  options={MODALITY_OPTIONS}
                  value={form.modality}
                  onChange={(e) => set('modality', e.target.value)}
                />
                <Input id="t-location" label="Lieu" value={form.location} onChange={(e) => set('location', e.target.value)} />
                <Input id="t-date" label="Date de début" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                <Input id="t-end" label="Date de fin" type="date" min={form.date || undefined} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                <Input id="t-price" label="Tarif" placeholder="Gratuit, 25 000 FCFA..." value={form.price} onChange={(e) => set('price', e.target.value)} />
                <Input
                  id="t-max"
                  label="Places disponibles"
                  type="number"
                  min={1}
                  value={form.maxParticipants}
                  onChange={(e) => set('maxParticipants', e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => set('isPublished', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Publiée sur le site
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>
                  {editing ? 'Enregistrer' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
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
          <div className="text-center py-8 text-gray-500 text-sm">Aucune formation enregistrée.</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {trainings.map((training) => {
            const count = activeCount(training);
            const expanded = expandedId === training.id;
            return (
              <Card key={training.id}>
                <div
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expanded ? null : training.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{training.title}</h3>
                      {!training.isPublished && <Badge>Brouillon</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(training.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {training.location || MODALITY_OPTIONS.find((m) => m.value === training.modality)?.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {count}
                        {training.maxParticipants ? ` / ${training.maxParticipants}` : ''} inscrit{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {training.isPublished && (
                      <a
                        href={`/formations/${training.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-primary-600"
                        title="Voir sur le site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => togglePublished(training)}>
                      {training.isPublished ? 'Dépublier' : 'Publier'}
                    </Button>
                    <button onClick={() => openEdit(training)} className="p-2 text-gray-400 hover:text-primary-600" title="Modifier">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(training)} className="p-2 text-gray-400 hover:text-red-600" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">Inscriptions ({training.registrations.length})</h4>
                      {training.registrations.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => exportRegistrations(training)}>
                          <Download className="h-3.5 w-3.5" />
                          Exporter
                        </Button>
                      )}
                    </div>
                    {training.registrations.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucune inscription pour le moment.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-left text-xs font-medium text-gray-500 uppercase">
                            <tr>
                              <th className="py-2 pr-4">Nom</th>
                              <th className="py-2 pr-4">Téléphone</th>
                              <th className="py-2 pr-4">Profil</th>
                              <th className="py-2 pr-4">Région</th>
                              <th className="py-2 pr-4">Statut</th>
                              <th className="py-2 pr-4">Inscrit le</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {training.registrations.map((reg) => (
                              <tr key={reg.id}>
                                <td className="py-2 pr-4 font-medium text-gray-900 whitespace-nowrap">
                                  {reg.firstName} {reg.lastName}
                                  {reg.email && <div className="text-xs font-normal text-gray-500">{reg.email}</div>}
                                </td>
                                <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">
                                  <a
                                    href={getWhatsAppUrl(reg.phone, `Bonjour ${reg.firstName}, Sen Biopest vous confirme votre inscription à la formation « ${training.title} ».`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-green-700 hover:underline"
                                  >
                                    {reg.phone}
                                  </a>
                                </td>
                                <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">
                                  {ACTOR_LABELS[reg.actorType] || reg.actorType}
                                  {reg.organization ? ` · ${reg.organization}` : ''}
                                </td>
                                <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{reg.region || '-'}</td>
                                <td className="py-2 pr-4">
                                  <Select
                                    options={REGISTRATION_STATUS_OPTIONS}
                                    value={reg.status}
                                    onChange={(e) => handleRegistrationStatus(training.id, reg.id, e.target.value)}
                                    className="w-36 py-1.5"
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
            );
          })}
        </div>
      )}
    </div>
  );
}

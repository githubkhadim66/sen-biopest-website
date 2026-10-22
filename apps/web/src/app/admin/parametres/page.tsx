'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert, SuccessAlert } from '@/components/admin/alerts';
import { Loader2, Plus, Edit2, Trash2, X, Save, Eye, EyeOff, Star } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string | null;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorLocation: string | null;
  content: string;
  rating: number | null;
  sortOrder: number;
  isActive: boolean;
}

const SETTING_FIELDS = [
  { key: 'whatsapp_number', label: 'Numéro WhatsApp', placeholder: '+221 77 000 00 00', type: 'tel' },
  { key: 'company_phone', label: 'Téléphone', placeholder: '+221 33 000 00 00', type: 'tel' },
  { key: 'company_email', label: 'Email de contact', placeholder: 'contact@senbiopest.com', type: 'email' },
  { key: 'company_address', label: 'Adresse', placeholder: 'Dakar, Sénégal', type: 'text' },
] as const;

const EMPTY_FAQ = { question: '', answer: '', category: '', sortOrder: 0, isActive: true };
const EMPTY_TESTIMONIAL = {
  authorName: '',
  authorRole: '',
  authorLocation: '',
  content: '',
  rating: 5,
  sortOrder: 0,
  isActive: true,
};

type Tab = 'settings' | 'faq' | 'testimonials';

export default function ParametresAdminPage() {
  const [tab, setTab] = useState<Tab>('settings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tForm, setTForm] = useState(EMPTY_TESTIMONIAL);
  const [editingTId, setEditingTId] = useState<string | null>(null);
  const [showTForm, setShowTForm] = useState(false);
  const [savingT, setSavingT] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setError('');
      const [settingsData, faqData, testimonialData] = await Promise.all([
        api.get<Setting[]>('/content/settings'),
        api.get<Faq[]>('/content/admin/faqs'),
        api.get<Testimonial[]>('/content/admin/testimonials'),
      ]);
      setSettings(Object.fromEntries(settingsData.map((s) => [s.key, s.value])));
      setFaqs(faqData);
      setTestimonials(testimonialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---------------- Settings ----------------
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setError('');
    try {
      const values = Object.fromEntries(SETTING_FIELDS.map((f) => [f.key, settings[f.key] ?? '']));
      const saved = await api.put<Setting[]>('/content/settings', { values });
      setSettings(Object.fromEntries(saved.map((s) => [s.key, s.value])));
      setSuccess('Informations enregistrées.');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSavingSettings(false);
    }
  }

  // ---------------- FAQ ----------------
  function openFaq(faq?: Faq) {
    setEditingFaqId(faq?.id ?? null);
    setFaqForm(
      faq
        ? { question: faq.question, answer: faq.answer, category: faq.category || '', sortOrder: faq.sortOrder, isActive: faq.isActive }
        : { ...EMPTY_FAQ, sortOrder: faqs.length },
    );
    setShowFaqForm(true);
  }

  async function handleFaqSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingFaq(true);
    setError('');
    try {
      const payload = { ...faqForm, sortOrder: Number(faqForm.sortOrder) || 0 };
      if (editingFaqId) {
        const updated = await api.put<Faq>(`/content/faqs/${editingFaqId}`, payload);
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await api.post<Faq>('/content/faqs', payload);
        setFaqs((prev) => [...prev, created]);
      }
      setFaqs((prev) => [...prev].sort((a, b) => a.sortOrder - b.sortOrder));
      setShowFaqForm(false);
      setSuccess('Question enregistrée.');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSavingFaq(false);
    }
  }

  async function toggleFaq(faq: Faq) {
    try {
      const updated = await api.put<Faq>(`/content/faqs/${faq.id}`, { isActive: !faq.isActive });
      setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function deleteFaq(faq: Faq) {
    if (!confirm(`Supprimer la question « ${faq.question} » ?`)) return;
    try {
      await api.delete(`/content/faqs/${faq.id}`);
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  // ---------------- Testimonials ----------------
  function openTestimonial(t?: Testimonial) {
    setEditingTId(t?.id ?? null);
    setTForm(
      t
        ? {
            authorName: t.authorName,
            authorRole: t.authorRole || '',
            authorLocation: t.authorLocation || '',
            content: t.content,
            rating: t.rating ?? 5,
            sortOrder: t.sortOrder,
            isActive: t.isActive,
          }
        : { ...EMPTY_TESTIMONIAL, sortOrder: testimonials.length },
    );
    setShowTForm(true);
  }

  async function handleTestimonialSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingT(true);
    setError('');
    try {
      const payload = { ...tForm, rating: Number(tForm.rating), sortOrder: Number(tForm.sortOrder) || 0 };
      if (editingTId) {
        const updated = await api.put<Testimonial>(`/content/testimonials/${editingTId}`, payload);
        setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await api.post<Testimonial>('/content/testimonials', payload);
        setTestimonials((prev) => [...prev, created]);
      }
      setTestimonials((prev) => [...prev].sort((a, b) => a.sortOrder - b.sortOrder));
      setShowTForm(false);
      setSuccess('Témoignage enregistré.');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSavingT(false);
    }
  }

  async function toggleTestimonial(t: Testimonial) {
    try {
      const updated = await api.put<Testimonial>(`/content/testimonials/${t.id}`, { isActive: !t.isActive });
      setTestimonials((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function deleteTestimonial(t: Testimonial) {
    if (!confirm(`Supprimer le témoignage de ${t.authorName} ?`)) return;
    try {
      await api.delete(`/content/testimonials/${t.id}`);
      setTestimonials((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'settings', label: 'Informations du site' },
    { id: 'faq', label: `FAQ (${faqs.length})` },
    { id: 'testimonials', label: `Témoignages (${testimonials.length})` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
              tab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onDone={() => setSuccess('')} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : tab === 'settings' ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Coordonnées affichées sur le site</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
              {SETTING_FIELDS.map((f) => (
                <Input
                  key={f.key}
                  id={`s-${f.key}`}
                  label={f.label}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={settings[f.key] ?? ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              ))}
              <Button type="submit" loading={savingSettings}>
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : tab === 'faq' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openFaq()}>
              <Plus className="h-4 w-4" />
              Ajouter une question
            </Button>
          </div>

          {showFaqForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{editingFaqId ? 'Modifier la question' : 'Nouvelle question'}</h2>
                  <button onClick={() => setShowFaqForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleFaqSubmit} className="space-y-4">
                  <Input
                    id="faq-q"
                    label="Question"
                    required
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  />
                  <Textarea
                    id="faq-a"
                    label="Réponse"
                    required
                    rows={4}
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="faq-cat"
                      label="Catégorie"
                      placeholder="produits, commande, livraison..."
                      value={faqForm.category}
                      onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    />
                    <Input
                      id="faq-order"
                      label="Ordre d'affichage"
                      type="number"
                      min={0}
                      value={faqForm.sortOrder}
                      onChange={(e) => setFaqForm({ ...faqForm, sortOrder: Number(e.target.value) })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={faqForm.isActive}
                      onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Visible sur le site
                  </label>
                  <div className="flex gap-3">
                    <Button type="submit" loading={savingFaq}>Enregistrer</Button>
                    <Button type="button" variant="outline" onClick={() => setShowFaqForm(false)}>Annuler</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {faqs.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500 text-sm">Aucune question pour le moment.</div>
            </Card>
          ) : (
            <Card>
              <ul className="divide-y divide-gray-100">
                {faqs.map((faq) => (
                  <li key={faq.id} className="px-5 py-4 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{faq.question}</p>
                        {faq.category && <Badge variant="info">{faq.category}</Badge>}
                        {!faq.isActive && <Badge>Masquée</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-start gap-1 shrink-0">
                      <button onClick={() => toggleFaq(faq)} className="p-2 text-gray-400 hover:text-primary-600" title={faq.isActive ? 'Masquer' : 'Afficher'}>
                        {faq.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openFaq(faq)} className="p-2 text-gray-400 hover:text-primary-600" title="Modifier">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteFaq(faq)} className="p-2 text-gray-400 hover:text-red-600" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openTestimonial()}>
              <Plus className="h-4 w-4" />
              Ajouter un témoignage
            </Button>
          </div>

          {showTForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{editingTId ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h2>
                  <button onClick={() => setShowTForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      id="t-name"
                      label="Nom"
                      required
                      value={tForm.authorName}
                      onChange={(e) => setTForm({ ...tForm, authorName: e.target.value })}
                    />
                    <Input
                      id="t-role"
                      label="Fonction"
                      placeholder="Maraîcher, présidente de GIE..."
                      value={tForm.authorRole}
                      onChange={(e) => setTForm({ ...tForm, authorRole: e.target.value })}
                    />
                    <Input
                      id="t-loc"
                      label="Localité"
                      value={tForm.authorLocation}
                      onChange={(e) => setTForm({ ...tForm, authorLocation: e.target.value })}
                    />
                  </div>
                  <Textarea
                    id="t-content"
                    label="Témoignage"
                    required
                    rows={4}
                    value={tForm.content}
                    onChange={(e) => setTForm({ ...tForm, content: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="t-rating"
                      label="Note (1 à 5)"
                      type="number"
                      min={1}
                      max={5}
                      value={tForm.rating}
                      onChange={(e) => setTForm({ ...tForm, rating: Number(e.target.value) })}
                    />
                    <Input
                      id="t-order"
                      label="Ordre d'affichage"
                      type="number"
                      min={0}
                      value={tForm.sortOrder}
                      onChange={(e) => setTForm({ ...tForm, sortOrder: Number(e.target.value) })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={tForm.isActive}
                      onChange={(e) => setTForm({ ...tForm, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Visible sur le site
                  </label>
                  <div className="flex gap-3">
                    <Button type="submit" loading={savingT}>Enregistrer</Button>
                    <Button type="button" variant="outline" onClick={() => setShowTForm(false)}>Annuler</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {testimonials.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500 text-sm">Aucun témoignage pour le moment.</div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.map((t) => (
                <Card key={t.id} className={cn(!t.isActive && 'opacity-60')}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{t.authorName}</p>
                        <p className="text-xs text-gray-500">
                          {[t.authorRole, t.authorLocation].filter(Boolean).join(' · ') || '—'}
                        </p>
                        {t.rating && (
                          <div className="flex gap-0.5 mt-1" aria-label={`${t.rating} sur 5`}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={cn('h-3.5 w-3.5', i < t.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggleTestimonial(t)} className="p-2 text-gray-400 hover:text-primary-600" title={t.isActive ? 'Masquer' : 'Afficher'}>
                          {t.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openTestimonial(t)} className="p-2 text-gray-400 hover:text-primary-600" title="Modifier">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteTestimonial(t)} className="p-2 text-gray-400 hover:text-red-600" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-3 italic">« {t.content} »</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

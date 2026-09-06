'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Loader2, Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronUp } from 'lucide-react';

interface SiteSettings {
  whatsappNumber: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  published: boolean;
}

export default function ParametresAdminPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'faq' | 'testimonials'>('settings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Site settings
  const [settings, setSettings] = useState<SiteSettings>({
    whatsappNumber: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // FAQ
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0 });
  const [savingFaq, setSavingFaq] = useState(false);

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    published: true,
  });
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [settingsData, faqData, testimonialsData] = await Promise.all([
        api.get<{ settings: SiteSettings }>('/content/settings').catch(() => ({ settings: settings })),
        api.get<{ faqs: FAQ[] }>('/content/faqs').catch(() => ({ faqs: [] })),
        api.get<{ testimonials: Testimonial[] }>('/content/testimonials').catch(() => ({ testimonials: [] })),
      ]);
      if (settingsData.settings) setSettings(settingsData.settings);
      setFaqs(faqData.faqs || []);
      setTestimonials(testimonialsData.testimonials || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function showMessage(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  // Settings handlers
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/content/settings', settings);
      showMessage('Paramètres enregistrés.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSavingSettings(false);
    }
  }

  // FAQ handlers
  function openFaqCreate() {
    setEditingFaq(null);
    setFaqForm({ question: '', answer: '', order: faqs.length });
    setShowFaqForm(true);
  }

  function openFaqEdit(faq: FAQ) {
    setEditingFaq(faq);
    setFaqForm({ question: faq.question, answer: faq.answer, order: faq.order });
    setShowFaqForm(true);
  }

  async function handleFaqSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingFaq(true);
    try {
      if (editingFaq) {
        await api.put(`/content/faqs/${editingFaq.id}`, faqForm);
      } else {
        await api.post('/content/faqs', faqForm);
      }
      setShowFaqForm(false);
      fetchAll();
      showMessage(editingFaq ? 'FAQ modifiée.' : 'FAQ ajoutée.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSavingFaq(false);
    }
  }

  async function handleDeleteFaq(faq: FAQ) {
    if (!confirm(`Supprimer cette FAQ ?`)) return;
    try {
      await api.delete(`/content/faqs/${faq.id}`);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  // Testimonial handlers
  function openTestimonialCreate() {
    setEditingTestimonial(null);
    setTestimonialForm({ name: '', role: '', content: '', rating: 5, published: true });
    setShowTestimonialForm(true);
  }

  function openTestimonialEdit(t: Testimonial) {
    setEditingTestimonial(t);
    setTestimonialForm({ name: t.name, role: t.role, content: t.content, rating: t.rating, published: t.published });
    setShowTestimonialForm(true);
  }

  async function handleTestimonialSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingTestimonial(true);
    try {
      if (editingTestimonial) {
        await api.put(`/content/testimonials/${editingTestimonial.id}`, testimonialForm);
      } else {
        await api.post('/content/testimonials', testimonialForm);
      }
      setShowTestimonialForm(false);
      fetchAll();
      showMessage(editingTestimonial ? 'Témoignage modifié.' : 'Témoignage ajouté.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSavingTestimonial(false);
    }
  }

  async function handleDeleteTestimonial(t: Testimonial) {
    if (!confirm(`Supprimer ce témoignage ?`)) return;
    try {
      await api.delete(`/content/testimonials/${t.id}`);
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function handleToggleTestimonialPublished(t: Testimonial) {
    try {
      await api.put(`/content/testimonials/${t.id}`, { published: !t.published });
      fetchAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  const tabs = [
    { key: 'settings' as const, label: 'Site' },
    { key: 'faq' as const, label: 'FAQ' },
    { key: 'testimonials' as const, label: 'Témoignages' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Site Settings */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Informations du site</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
              <Input
                label="Numéro WhatsApp"
                placeholder="+221770000000"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              />
              <Input
                label="Nom de l'entreprise"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              />
              <Input
                label="Téléphone"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              />
              <Textarea
                label="Adresse"
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              />
              <Button type="submit" loading={savingSettings}>
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openFaqCreate}>
              <Plus className="h-4 w-4" />
              Ajouter une FAQ
            </Button>
          </div>

          {showFaqForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{editingFaq ? 'Modifier' : 'Nouvelle FAQ'}</h2>
                  <button onClick={() => setShowFaqForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleFaqSubmit} className="space-y-4">
                  <Input
                    label="Question"
                    required
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  />
                  <Textarea
                    label="Réponse"
                    required
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  />
                  <Input
                    label="Ordre"
                    type="number"
                    value={faqForm.order}
                    onChange={(e) => setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })}
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" type="button" onClick={() => setShowFaqForm(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" loading={savingFaq}>
                      {editingFaq ? 'Enregistrer' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {faqs.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500 text-sm">Aucune FAQ.</div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-2">
              {faqs
                .sort((a, b) => a.order - b.order)
                .map((faq) => (
                  <Card key={faq.id}>
                    <div className="px-5 py-3 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{faq.question}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openFaqEdit(faq)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openTestimonialCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un témoignage
            </Button>
          </div>

          {showTestimonialForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{editingTestimonial ? 'Modifier' : 'Nouveau témoignage'}</h2>
                  <button onClick={() => setShowTestimonialForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nom"
                      required
                      value={testimonialForm.name}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    />
                    <Input
                      label="Rôle / Fonction"
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    />
                  </div>
                  <Textarea
                    label="Témoignage"
                    required
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Note (1-5)"
                      type="number"
                      min={1}
                      max={5}
                      value={testimonialForm.rating}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) || 5 })}
                    />
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={testimonialForm.published}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, published: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        Publié
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" type="button" onClick={() => setShowTestimonialForm(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" loading={savingTestimonial}>
                      {editingTestimonial ? 'Enregistrer' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {testimonials.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8 text-gray-500 text-sm">Aucun témoignage.</div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <Card key={t.id}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleTestimonialPublished(t)}
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                            t.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          )}
                        >
                          {t.published ? 'Publié' : 'Brouillon'}
                        </button>
                        <button
                          onClick={() => openTestimonialEdit(t)}
                          className="p-1 text-gray-400 hover:text-primary-600 rounded"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{t.content}</p>
                    <div className="mt-2 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= t.rating ? 'text-yellow-400' : 'text-gray-200'}>
                          &#9733;
                        </span>
                      ))}
                    </div>
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Leaf,
  MessageCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { api } from '@/lib/api';
import { getWhatsAppUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings } from '@/hooks/use-site-settings';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

const ACTOR_TYPES = [
  { value: 'PRODUCTEUR', label: 'Producteur' },
  { value: 'COOPERATIVE', label: 'Cooperative' },
  { value: 'GIE', label: 'GIE' },
  { value: 'JARDINIER', label: 'Jardinier' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'ENTREPRISE', label: 'Entreprise' },
  { value: 'PARTICULIER', label: 'Particulier' },
  { value: 'AUTRE', label: 'Autre' },
];

const REGIONS = [
  { value: 'Dakar', label: 'Dakar' },
  { value: 'Thies', label: 'Thies' },
  { value: 'Saint-Louis', label: 'Saint-Louis' },
  { value: 'Kaolack', label: 'Kaolack' },
  { value: 'Ziguinchor', label: 'Ziguinchor' },
  { value: 'Tambacounda', label: 'Tambacounda' },
  { value: 'Louga', label: 'Louga' },
  { value: 'Fatick', label: 'Fatick' },
  { value: 'Matam', label: 'Matam' },
  { value: 'Diourbel', label: 'Diourbel' },
  { value: 'Kaffrine', label: 'Kaffrine' },
  { value: 'Kedougou', label: 'Kedougou' },
  { value: 'Kolda', label: 'Kolda' },
  { value: 'Sedhiou', label: 'Sedhiou' },
];

export default function PanierPage() {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();
  const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    actorType: '',
    organization: '',
    locality: '',
    region: '',
    cropConcerned: '',
    message: '',
    consent: false,
  });

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const productSummary = items
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(', ');

  const handleSubmitOrder = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.actorType || !form.consent) {
      setError('Veuillez remplir tous les champs obligatoires et accepter les conditions.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/commercial-requests', {
        type: 'COMMANDE',
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email || undefined,
        actorType: form.actorType,
        organization: form.organization || undefined,
        locality: form.locality || undefined,
        region: form.region || undefined,
        productInterest: productSummary,
        quantity: items.reduce((sum, i) => sum + i.quantity, 0).toString(),
        cropConcerned: form.cropConcerned || undefined,
        message: form.message || undefined,
        consent: form.consent,
        source: 'panier',
      });

      clearCart();
      setStep('success');
    } catch (err) {
      setError((err as Error).message || 'Erreur lors de l\'envoi de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const lines = items.map((item) => `- ${item.name} (x${item.quantity})`).join('\n');
    const msg = `Bonjour Sen Biopest, je souhaite passer commande :\n\n${lines}\n\nNom: ${form.firstName} ${form.lastName}\nTel: ${form.phone}${form.region ? `\nRegion: ${form.region}` : ''}${form.message ? `\nMessage: ${form.message}` : ''}`;
    window.open(getWhatsAppUrl(WHATSAPP_NUMBER, msg), '_blank');
  };

  // Success state
  if (step === 'success') {
    return (
      <section className="section-padding bg-white">
        <div className="container-narrow text-center py-16">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Commande envoyee avec succes !
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Votre commande a ete enregistree. Notre equipe vous contactera sous 24h pour confirmer les details et la livraison.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/produits">
              <Button>Continuer les achats</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Retour a l&apos;accueil</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Empty cart
  if (items.length === 0 && step === 'cart') {
    return (
      <section className="section-padding bg-white">
        <div className="container-narrow text-center py-16">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 mb-6">
            Parcourez notre catalogue pour ajouter des produits.
          </p>
          <Link href="/produits">
            <Button>Voir les produits</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-green-50">
        <div className="container-wide py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-7 h-7 text-primary-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {step === 'cart' ? 'Mon panier' : 'Finaliser la commande'}
            </h1>
          </div>
          <p className="text-gray-600">
            {step === 'cart'
              ? `${totalItems} produit${totalItems > 1 ? 's' : ''} dans votre panier`
              : 'Remplissez vos informations pour valider la commande'}
          </p>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-wide max-w-4xl">
          {step === 'cart' && (
            <>
              {/* Cart items */}
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Leaf className="w-8 h-8 text-primary-200" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/produits/${item.slug}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {item.shortDescription}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      title="Retirer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <Link href="/produits">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4" /> Continuer les achats
                  </Button>
                </Link>
                <Button onClick={() => setStep('form')}>
                  Passer la commande <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {step === 'form' && (
            <>
              {/* Order summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Resume de la commande</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer form */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8">
                <h3 className="font-semibold text-gray-900 mb-6">Vos informations</h3>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="firstName"
                    label="Prenom"
                    required
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    placeholder="Votre prenom"
                  />
                  <Input
                    id="lastName"
                    label="Nom"
                    required
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    placeholder="Votre nom"
                  />
                  <Input
                    id="phone"
                    label="Telephone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+221 77 000 00 00"
                  />
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="votre@email.com"
                  />
                  <Select
                    id="actorType"
                    label="Vous etes"
                    required
                    options={ACTOR_TYPES}
                    placeholder="Selectionnez votre profil"
                    value={form.actorType}
                    onChange={(e) => updateForm('actorType', e.target.value)}
                  />
                  <Input
                    id="organization"
                    label="Organisation"
                    value={form.organization}
                    onChange={(e) => updateForm('organization', e.target.value)}
                    placeholder="Nom de votre structure"
                  />
                  <Select
                    id="region"
                    label="Region"
                    options={REGIONS}
                    placeholder="Selectionnez votre region"
                    value={form.region}
                    onChange={(e) => updateForm('region', e.target.value)}
                  />
                  <Input
                    id="locality"
                    label="Localite"
                    value={form.locality}
                    onChange={(e) => updateForm('locality', e.target.value)}
                    placeholder="Ville ou village"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      id="cropConcerned"
                      label="Cultures concernees"
                      value={form.cropConcerned}
                      onChange={(e) => updateForm('cropConcerned', e.target.value)}
                      placeholder="Ex: tomate, oignon, pomme de terre..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      id="message"
                      label="Message ou precisions"
                      value={form.message}
                      onChange={(e) => updateForm('message', e.target.value)}
                      placeholder="Informations complementaires sur votre commande..."
                    />
                  </div>
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => updateForm('consent', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">
                    J&apos;accepte que mes informations soient utilisees pour traiter ma commande. *
                  </span>
                </label>

                {/* Submit buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={() => setStep('cart')}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors order-3 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Retour au panier
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto order-1 sm:order-2">
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                    >
                      {submitting ? 'Envoi en cours...' : 'Valider la commande'}
                    </Button>
                    <Button
                      variant="whatsapp"
                      onClick={handleWhatsAppOrder}
                      disabled={!form.firstName || !form.lastName || !form.phone}
                    >
                      <MessageCircle className="w-5 h-5" /> Commander via WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

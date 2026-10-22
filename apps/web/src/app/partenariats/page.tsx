'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody } from '@/components/ui/card';
import {
  Handshake,
  CheckCircle,
  Truck,
  Store,
  Building2,
  FlaskConical,
  Wallet,
  FolderKanban,
  ShoppingCart,
  Users,
  Globe,
  Leaf,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { SENEGAL_REGIONS, PartnerType } from '@sen-biopest/types';

const partnerTypeConfig: Record<
  string,
  { label: string; icon: React.ElementType; description: string }
> = {
  FOURNISSEUR: {
    label: 'Fournisseur',
    icon: Truck,
    description:
      'Fournissez des matières premières naturelles ou des équipements pour la production de biopesticides.',
  },
  DISTRIBUTEUR: {
    label: 'Distributeur',
    icon: Store,
    description:
      'Distribuez nos produits biopesticides dans votre région ou réseau de vente.',
  },
  INSTITUTION: {
    label: 'Institution',
    icon: Building2,
    description:
      'Collaborez sur des programmes de recherche, de formation ou de vulgarisation agricole.',
  },
  LABORATOIRE: {
    label: 'Laboratoire',
    icon: FlaskConical,
    description:
      'Participez au développement et à la validation de nouvelles formulations biologiques.',
  },
  FINANCEUR: {
    label: 'Financeur',
    icon: Wallet,
    description:
      'Soutenez financierement le developpement de solutions biologiques pour l\'agriculture africaine.',
  },
  PROGRAMME: {
    label: 'Programme',
    icon: FolderKanban,
    description:
      'Intégrez nos solutions dans vos programmes de développement agricole ou de sécurité alimentaire.',
  },
  ACHETEUR: {
    label: 'Acheteur',
    icon: ShoppingCart,
    description:
      'Achetez en gros nos biopesticides pour vos exploitations, coopératives ou projets.',
  },
};

const partnershipSchema = z.object({
  partnerType: z.nativeEnum(PartnerType, {
    errorMap: () => ({ message: 'Sélectionnez un type de partenariat' }),
  }),
  organizationName: z.string().min(2, 'Le nom de l\'organisation est requis'),
  contactName: z.string().min(2, 'Le nom du contact est requis'),
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  locality: z.string().optional(),
  region: z.string().optional(),
  proposal: z.string().min(20, 'Décrivez votre proposition (min. 20 caracteres)'),
  objectives: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
});

type PartnershipFormData = z.infer<typeof partnershipSchema>;

export default function PartenariatsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipSchema),
  });

  const onSubmit = async (data: PartnershipFormData) => {
    try {
      setError(null);
      await api.post('/partnerships', data);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-green-50">
        <div className="container-wide py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-800">Accueil</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-gray-700">Partenariats</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Construisons ensemble une agriculture durable au Sénégal
            </h1>
            <p className="text-lg text-gray-600">
              Sen Biopest recherche des partenaires engages pour developper, distribuer et
              promouvoir les biopesticides a base de plantes locales dans toute l&apos;Afrique de l&apos;Ouest.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Types de partenariats
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quel que soit votre profil, il y a une opportunite de collaboration avec Sen Biopest.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Object.entries(partnerTypeConfig).map(([key, config]) => (
              <Card key={key} hover>
                <CardBody className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <config.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{config.label}</h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="section-padding bg-primary-700 text-white">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">L&apos;impact de nos partenariats</h2>
            <p className="text-primary-100 max-w-2xl mx-auto">
              Ensemble, nous creons un impact positif pour les producteurs et l&apos;environnement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                value: '500+',
                label: 'Producteurs accompagnes',
              },
              {
                icon: Globe,
                value: '14',
                label: 'Régions couvertes',
              },
              {
                icon: Leaf,
                value: '100%',
                label: 'Solutions biologiques',
              },
              {
                icon: TrendingUp,
                value: '30%',
                label: 'Réduction des pertes',
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                  <stat.icon className="w-6 h-6 text-secondary-400" />
                </div>
                <div className="text-3xl font-bold text-secondary-400 mb-1">{stat.value}</div>
                <div className="text-sm text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section className="section-padding bg-gray-50">
        <div className="container-narrow">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposition envoyée !</h2>
              <p className="text-gray-600 mb-6">
                Merci pour votre interet ! Votre proposition de partenariat a bien ete enregistree.
                Notre equipe l&apos;examinera et vous contactera prochainement.
              </p>
              <Link href="/">
                <Button variant="outline">Retour a l&apos;accueil</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Proposer un partenariat
                </h2>
                <p className="text-gray-600">
                  Remplissez le formulaire ci-dessous pour nous faire part de votre proposition.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
                  {error}
                </div>
              )}

              <Card>
                <CardBody>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Partnership Type */}
                    <Select
                      label="Type de partenariat"
                      id="partnerType"
                      required
                      placeholder="Sélectionnez le type de partenariat"
                      options={Object.entries(partnerTypeConfig).map(([value, config]) => ({
                        value,
                        label: config.label,
                      }))}
                      error={errors.partnerType?.message}
                      {...register('partnerType')}
                    />

                    {/* Organization */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        Votre organisation
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Nom de l'organisation"
                            id="organizationName"
                            placeholder="Nom de votre structure"
                            required
                            error={errors.organizationName?.message}
                            {...register('organizationName')}
                          />
                          <Input
                            label="Nom du contact"
                            id="contactName"
                            placeholder="Prénom et nom du responsable"
                            required
                            error={errors.contactName?.message}
                            {...register('contactName')}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Telephone"
                            id="phone"
                            type="tel"
                            placeholder="+221 7X XXX XX XX"
                            required
                            error={errors.phone?.message}
                            {...register('phone')}
                          />
                          <Input
                            label="Email"
                            id="email"
                            type="email"
                            placeholder="contact@organisation.sn"
                            error={errors.email?.message}
                            {...register('email')}
                          />
                        </div>

                        <Input
                          label="Site web"
                          id="website"
                          type="url"
                          placeholder="https://www.organisation.sn"
                          error={errors.website?.message}
                          {...register('website')}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Localite"
                            id="locality"
                            placeholder="Votre ville"
                            error={errors.locality?.message}
                            {...register('locality')}
                          />
                          <Select
                            label="Region"
                            id="region"
                            placeholder="Sélectionnez une région"
                            options={SENEGAL_REGIONS.map((r) => ({ value: r, label: r }))}
                            error={errors.region?.message}
                            {...register('region')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Proposal */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        Votre proposition
                      </h3>
                      <div className="space-y-4">
                        <Textarea
                          label="Proposition de partenariat"
                          id="proposal"
                          placeholder="Décrivez votre proposition de collaboration avec Sen Biopest..."
                          required
                          error={errors.proposal?.message}
                          {...register('proposal')}
                        />
                        <Textarea
                          label="Objectifs vises"
                          id="objectives"
                          placeholder="Quels objectifs souhaitez-vous atteindre à travers ce partenariat ?"
                          error={errors.objectives?.message}
                          {...register('objectives')}
                        />
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="consent"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        {...register('consent')}
                      />
                      <label htmlFor="consent" className="text-sm text-gray-600">
                        J&apos;accepte que mes donnees soient utilisees pour le traitement de ma
                        proposition de partenariat. <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-sm text-red-600">{errors.consent.message}</p>
                    )}

                    <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                      <Handshake className="w-5 h-5" /> Envoyer ma proposition
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </section>
    </>
  );
}

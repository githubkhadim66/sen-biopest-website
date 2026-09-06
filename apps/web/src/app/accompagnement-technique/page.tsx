'use client';

import { useState, useRef } from 'react';
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
  Sprout,
  CheckCircle,
  Camera,
  Upload,
  X,
  Bug,
  Search,
  MessageCircle,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { SENEGAL_REGIONS, ActorType } from '@sen-biopest/types';

const actorTypeLabels: Record<string, string> = {
  PRODUCTEUR: 'Producteur',
  COOPERATIVE: 'Cooperative',
  GIE: 'GIE',
  JARDINIER: 'Jardinier',
  INSTITUTION: 'Institution',
  ENTREPRISE: 'Entreprise',
  PARTICULIER: 'Particulier',
  AUTRE: 'Autre',
};

const technicalSchema = z.object({
  firstName: z.string().min(2, 'Le prenom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(9, 'Numero de telephone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  organization: z.string().optional(),
  actorType: z.nativeEnum(ActorType, { errorMap: () => ({ message: 'Selectionnez un type' }) }),
  locality: z.string().optional(),
  region: z.string().optional(),
  crop: z.string().min(2, 'Indiquez la culture concernee'),
  cropStage: z.string().optional(),
  symptoms: z.string().min(10, 'Decrivez les symptomes observes (min. 10 caracteres)'),
  description: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
});

type TechnicalFormData = z.infer<typeof technicalSchema>;

export default function AccompagnementTechniquePage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TechnicalFormData>({
    resolver: zodResolver(technicalSchema),
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: TechnicalFormData) => {
    try {
      setError(null);
      let photoUrl: string | undefined;

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await api.upload<{ data: { url: string } }>('/uploads/single', formData);
        photoUrl = uploadRes.data.url;
      }

      await api.post('/technical-requests', {
        ...data,
        ...(photoUrl ? { photos: [photoUrl] } : {}),
      });

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
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              <Sprout className="w-4 h-4" />
              Accompagnement technique
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Un probleme sur vos cultures ? Nous sommes la pour vous aider
            </h1>
            <p className="text-lg text-gray-600">
              Nos conseillers techniques vous accompagnent pour identifier les ravageurs,
              diagnostiquer les problemes phytosanitaires et vous proposer des solutions
              biologiques adaptees.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Comment ca marche ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bug,
                title: 'Decrivez le probleme',
                desc: 'Indiquez la culture, les symptomes observes et le stade de la culture.',
              },
              {
                icon: Camera,
                title: 'Ajoutez une photo',
                desc: 'Prenez une photo des degats pour aider notre equipe a diagnostiquer.',
              },
              {
                icon: Search,
                title: 'Diagnostic expert',
                desc: 'Nos conseillers analysent votre demande et identifient le probleme.',
              },
              {
                icon: ClipboardCheck,
                title: 'Solution personnalisee',
                desc: 'Recevez des recommandations adaptees et un suivi de votre situation.',
              },
            ].map((step) => (
              <Card key={step.title}>
                <CardBody className="text-center space-y-3">
                  <div className="mx-auto w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-padding bg-gray-50">
        <div className="container-narrow">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyee !</h2>
              <p className="text-gray-600 mb-6">
                Votre demande d&apos;accompagnement technique a bien ete enregistree.
                Un conseiller vous contactera dans les plus brefs delais pour vous aider.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/">
                  <Button variant="outline">Retour a l&apos;accueil</Button>
                </Link>
                <Link href="/produits">
                  <Button>Voir nos produits</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Demander un accompagnement
                </h2>
                <p className="text-gray-600">
                  Remplissez le formulaire et notre equipe vous repondra rapidement.
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
                    {/* Identity */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        Vos informations
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Prenom"
                            id="firstName"
                            placeholder="Votre prenom"
                            required
                            error={errors.firstName?.message}
                            {...register('firstName')}
                          />
                          <Input
                            label="Nom"
                            id="lastName"
                            placeholder="Votre nom"
                            required
                            error={errors.lastName?.message}
                            {...register('lastName')}
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
                            placeholder="votre@email.com"
                            error={errors.email?.message}
                            {...register('email')}
                          />
                        </div>

                        <Input
                          label="Organisation"
                          id="organization"
                          placeholder="Nom de votre organisation (facultatif)"
                          error={errors.organization?.message}
                          {...register('organization')}
                        />

                        <Select
                          label="Type d'acteur"
                          id="actorType"
                          required
                          placeholder="Selectionnez votre profil"
                          options={Object.entries(actorTypeLabels).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                          error={errors.actorType?.message}
                          {...register('actorType')}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Localite"
                            id="locality"
                            placeholder="Votre ville ou village"
                            error={errors.locality?.message}
                            {...register('locality')}
                          />
                          <Select
                            label="Region"
                            id="region"
                            placeholder="Selectionnez une region"
                            options={SENEGAL_REGIONS.map((r) => ({ value: r, label: r }))}
                            error={errors.region?.message}
                            {...register('region')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technical Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                        Informations sur le probleme
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Culture concernee"
                            id="crop"
                            placeholder="Ex: tomate, oignon, chou..."
                            required
                            error={errors.crop?.message}
                            {...register('crop')}
                          />
                          <Input
                            label="Stade de la culture"
                            id="cropStage"
                            placeholder="Ex: floraison, fructification..."
                            error={errors.cropStage?.message}
                            {...register('cropStage')}
                          />
                        </div>

                        <Textarea
                          label="Symptomes observes"
                          id="symptoms"
                          placeholder="Decrivez les symptomes que vous observez sur vos plantes..."
                          required
                          error={errors.symptoms?.message}
                          {...register('symptoms')}
                        />

                        <Textarea
                          label="Description complementaire"
                          id="description"
                          placeholder="Informations supplementaires (traitements deja effectues, date d'apparition, etc.)"
                          error={errors.description?.message}
                          {...register('description')}
                        />

                        {/* Photo upload */}
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Photo des degats
                          </label>
                          {photoPreview ? (
                            <div className="relative inline-block">
                              <img
                                src={photoPreview}
                                alt="Apercu"
                                className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
                            >
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Cliquez pour ajouter une photo
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG (max 5 Mo)
                              </p>
                            </button>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </div>
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
                        J&apos;accepte que mes donnees soient utilisees pour le traitement de ma demande
                        d&apos;accompagnement technique. <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-sm text-red-600">{errors.consent.message}</p>
                    )}

                    <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                      <MessageCircle className="w-5 h-5" /> Envoyer ma demande
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

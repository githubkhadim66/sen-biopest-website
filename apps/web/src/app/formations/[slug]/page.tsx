'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Target,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import {
  SENEGAL_REGIONS,
  ActorType,
  type TrainingDetail,
  type TrainingModality,
} from '@sen-biopest/types';

const modalityLabels: Record<TrainingModality, string> = {
  PRESENTIEL: 'Presentiel',
  EN_LIGNE: 'En ligne',
  HYBRIDE: 'Hybride',
};

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

const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prenom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(9, 'Numero de telephone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  organization: z.string().optional(),
  actorType: z.nativeEnum(ActorType, { errorMap: () => ({ message: 'Selectionnez un type' }) }),
  locality: z.string().optional(),
  region: z.string().optional(),
  motivation: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function TrainingDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [training, setTraining] = useState<TrainingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  useEffect(() => {
    if (!slug) return;
    api
      .get<TrainingDetail>(`/trainings/${slug}`)
      .then(setTraining)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const onSubmit = async (data: RegistrationFormData) => {
    if (!training) return;
    try {
      await api.post('/trainings/register', {
        ...data,
        trainingId: training.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !training) {
    return (
      <div className="text-center py-32">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/formations">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" /> Retour aux formations
          </Button>
        </Link>
      </div>
    );
  }

  if (!training) return null;

  const isFull = !!training.maxParticipants && training.registrationCount >= training.maxParticipants;
  const isPast = !!training.date && new Date(training.date) < new Date();
  const registrationClosed = !submitted && (isFull || isPast);

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="container-wide py-4">
          <Link
            href="/formations"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux formations
          </Link>
        </div>
      </section>

      {/* Training Info */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <Badge
                  variant={
                    training.modality === 'PRESENTIEL'
                      ? 'info'
                      : training.modality === 'EN_LIGNE'
                        ? 'success'
                        : 'warning'
                  }
                  className="mb-3"
                >
                  {modalityLabels[training.modality]}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {training.title}
                </h1>
                <p className="text-gray-600 leading-relaxed">{training.description}</p>
              </div>

              {/* Objectives */}
              {training.objectives && training.objectives.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-600" />
                    Objectifs de la formation
                  </h2>
                  <ul className="space-y-2">
                    {training.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div>
              <Card className="sticky top-24">
                <CardBody className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Informations pratiques</h3>

                  {training.date && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CalendarDays className="w-5 h-5 text-primary-600 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Date</p>
                        <p>
                          {formatDate(training.date)}
                          {training.endDate && ` - ${formatDate(training.endDate)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {training.duration && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-primary-600 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Duree</p>
                        <p>{training.duration}</p>
                      </div>
                    </div>
                  )}

                  {training.location && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="w-5 h-5 text-primary-600 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Lieu</p>
                        <p>{training.location}</p>
                      </div>
                    </div>
                  )}

                  {training.targetAudience && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Users className="w-5 h-5 text-primary-600 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Public cible</p>
                        <p>{training.targetAudience}</p>
                      </div>
                    </div>
                  )}

                  {training.price && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500">Prix</p>
                      <p className="text-2xl font-bold text-primary-600">{training.price}</p>
                    </div>
                  )}

                  {training.maxParticipants && (
                    <div className="text-xs text-gray-500">
                      {training.registrationCount} / {training.maxParticipants} places occupees
                    </div>
                  )}

                  <a href="#inscription">
                    <Button className="w-full mt-2">
                      <GraduationCap className="w-4 h-4" /> S&apos;inscrire
                    </Button>
                  </a>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      {registrationClosed && (
          <section id="inscription" className="section-padding bg-gray-50">
            <div className="container-narrow text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isPast ? 'Cette session est terminée' : 'Cette formation est complète'}
              </h2>
              <p className="text-gray-600 mb-6">
                Contactez-nous pour être informé(e) des prochaines sessions.
              </p>
              <Link href="/contact">
                <Button>Nous contacter</Button>
              </Link>
            </div>
          </section>
      )}
      {!registrationClosed && (
      <section id="inscription" className="section-padding bg-gray-50">
        <div className="container-narrow">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription envoyee !</h2>
              <p className="text-gray-600 mb-6">
                Votre inscription a la formation &laquo; {training.title} &raquo; a bien ete enregistree.
                Nous vous contacterons prochainement pour confirmer votre participation.
              </p>
              <Link href="/formations">
                <Button variant="outline">Voir les autres formations</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Inscription a la formation
                </h2>
                <p className="text-gray-600">
                  Remplissez le formulaire ci-dessous pour vous inscrire a cette formation.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
                  {error}
                </div>
              )}

              <Card>
                <CardBody>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                    <Textarea
                      label="Motivation"
                      id="motivation"
                      placeholder="Pourquoi souhaitez-vous participer a cette formation ?"
                      error={errors.motivation?.message}
                      {...register('motivation')}
                    />

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="consent"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        {...register('consent')}
                      />
                      <label htmlFor="consent" className="text-sm text-gray-600">
                        J&apos;accepte que mes donnees soient utilisees pour le traitement de mon inscription
                        et la communication relative a cette formation. <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-sm text-red-600">{errors.consent.message}</p>
                    )}

                    <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                      <GraduationCap className="w-5 h-5" /> Envoyer mon inscription
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </section>
      )}
    </>
  );
}

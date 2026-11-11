'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn, formatDate, getTrainingStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';
import type { TrainingSummary, TrainingModality } from '@sen-biopest/types';
import { PageHeader } from '@/components/layout/page-header';

const modalityLabels: Record<TrainingModality, string> = {
  PRESENTIEL: 'Présentiel',
  EN_LIGNE: 'En ligne',
  HYBRIDE: 'Hybride',
};

const modalityColors: Record<TrainingModality, 'info' | 'success' | 'warning'> = {
  PRESENTIEL: 'info',
  EN_LIGNE: 'success',
  HYBRIDE: 'warning',
};

export default function FormationsPage() {
  const [trainings, setTrainings] = useState<TrainingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<TrainingSummary[]>('/trainings')
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        // Upcoming sessions first (soonest first), finished ones after (most recent first)
        const time = (t: TrainingSummary) => (t.date ? new Date(t.date).getTime() : Infinity);
        const open = list.filter((t) => getTrainingStatus(t.date, t.endDate) !== 'past').sort((a, b) => time(a) - time(b));
        const done = list.filter((t) => getTrainingStatus(t.date, t.endDate) === 'past').sort((a, b) => time(b) - time(a));
        setTrainings([...open, ...done]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <PageHeader
        breadcrumb={[{ label: 'Formations' }]}
        title={
          <>
            Renforcez vos compétences en agriculture biologique
          </>
        }
        description={
          <>
            Découvrez nos formations pratiques sur l&apos;utilisation des biopesticides,
            la protection des cultures et les bonnes pratiques agricoles.
          </>
        }
      />

      {/* Training Grid */}
      <section className="section-first bg-white">
        <div className="container-wide">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          )}

          {!loading && !error && trainings.length === 0 && (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune formation disponible
              </h2>
              <p className="text-gray-600">
                Revenez bientôt pour découvrir nos prochaines formations.
              </p>
            </div>
          )}

          {/* Cards keep a fixed width and stay centred, so 1 or 2 trainings do not hug the left edge */}
          {!loading && !error && trainings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,380px))] justify-center gap-6">
              {trainings.map((training) => {
                const status = getTrainingStatus(training.date, training.endDate);
                const closed = status !== 'upcoming';
                return (
                <Card key={training.id} hover={!closed} className={cn('flex flex-col', closed && 'bg-gray-50/60')}>
                  <CardBody className="flex flex-col flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {status === 'past' && <Badge variant="danger">Terminée</Badge>}
                      {status === 'ongoing' && <Badge variant="danger">En cours · inscriptions closes</Badge>}
                      <Badge variant={modalityColors[training.modality]}>
                        {modalityLabels[training.modality]}
                      </Badge>
                      {training.price && (
                        <Badge variant="default">{training.price}</Badge>
                      )}
                    </div>

                    <h3 className={cn('text-lg font-semibold line-clamp-2', closed ? 'text-gray-600' : 'text-gray-900')}>
                      <Link href={`/formations/${training.slug}`} className="hover:text-primary-600 transition-colors">
                        {training.title}
                      </Link>
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                      {training.description}
                    </p>

                    <div className="space-y-1.5 text-sm text-gray-500">
                      {training.date && (
                        <div className={cn('flex items-center gap-2', status === 'past' && 'text-red-600 font-medium')}>
                          <CalendarDays className="w-4 h-4 shrink-0" />
                          <span>
                            {formatDate(training.date)}
                            {training.endDate && training.endDate.slice(0, 10) !== training.date.slice(0, 10) && ` – ${formatDate(training.endDate)}`}
                          </span>
                        </div>
                      )}
                      {training.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>{training.location}</span>
                        </div>
                      )}
                      {training.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{training.duration}</span>
                        </div>
                      )}
                      {training.targetAudience && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 shrink-0" />
                          <span className="line-clamp-1">{training.targetAudience}</span>
                        </div>
                      )}
                    </div>

                    {closed ? (
                      <div className="pt-2">
                        <Button size="sm" variant="outline" disabled className="w-full border-red-200 text-red-700 bg-red-50 disabled:opacity-100 cursor-not-allowed">
                          <Lock className="w-4 h-4" /> Inscriptions closes
                        </Button>
                      </div>
                    ) : (
                      <Link href={`/formations/${training.slug}`} className="pt-2">
                        <Button size="sm" className="w-full">
                          S&apos;inscrire <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </CardBody>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
      .then((res) => setTrainings(Array.isArray(res) ? res : []))
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
              {trainings.map((training) => (
                <Card key={training.id} hover className="flex flex-col">
                  <CardBody className="flex flex-col flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={modalityColors[training.modality]}>
                        {modalityLabels[training.modality]}
                      </Badge>
                      {training.price && (
                        <Badge variant="default">{training.price}</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {training.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                      {training.description}
                    </p>

                    <div className="space-y-1.5 text-sm text-gray-500">
                      {training.date && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 shrink-0" />
                          <span>{formatDate(training.date)}</span>
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

                    <Link href={`/formations/${training.slug}`} className="pt-2">
                      <Button size="sm" className="w-full">
                        S&apos;inscrire <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

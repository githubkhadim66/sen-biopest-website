import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Sprout,
  FlaskConical,
  Handshake,
  ArrowRight,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { CtaCard } from '@/components/ui/cta-card';

export const metadata: Metadata = {
  title: 'Nos services',
  description:
    'Découvrez les services de Sen Biopest : accompagnement technique, recherche et innovation, partenariats pour une agriculture durable au Sénégal.',
  openGraph: {
    title: 'Services — Sen Biopest',
    description:
      'Accompagnement technique, recherche et partenariats. Sen Biopest vous accompagne dans votre transition vers une agriculture durable.',
  },
};

const services = [
  {
    icon: Sprout,
    title: 'Accompagnement technique',
    description:
      'Un suivi personnalisé de vos cultures par nos agronomes. Diagnostic phytosanitaire, recommandations d\'application et suivi des résultats. Un accompagnement de proximité, disponible aussi via WhatsApp pour un conseil rapide.',
    highlights: [
      'Diagnostic personnalisé de vos cultures',
      'Recommandations d\'application sur mesure',
      'Suivi post-traitement des résultats',
      'Conseil rapide par photo via WhatsApp',
    ],
    href: '/accompagnement-technique',
    cta: 'Demander un accompagnement',
  },
  {
    icon: FlaskConical,
    title: 'Recherche & Innovation',
    description:
      'Notre laboratoire de recherche explore en permanence de nouvelles plantes locales et formulations pour élargir notre gamme. Nous collaborons avec des universités et centres de recherche pour valider scientifiquement nos produits.',
    highlights: [
      'Criblage de plantes locales à potentiel pesticide',
      'Tests d\'efficacité en conditions réelles',
      'Développement de nouvelles formulations',
      'Partenariats scientifiques et académiques',
    ],
    href: '/contact',
    cta: 'Nous contacter',
  },
  {
    icon: Handshake,
    title: 'Partenariats',
    description:
      'Nous construisons un écosystème de partenaires engagés pour la transition agroécologique. Fournisseurs de matières premières, distributeurs, ONG, institutions publiques et programmes de développement : collaborons ensemble.',
    highlights: [
      'Fourniture de matières premières végétales',
      'Distribution et commercialisation',
      'Intégration dans les programmes agricoles',
      'Co-développement de solutions sur mesure',
    ],
    href: '/partenariats',
    cta: 'Proposer un partenariat',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <PageHeader
        breadcrumb={[{ label: 'Services' }]}
        title={
          <>
            Un accompagnement complet pour{' '}
            <span className="text-primary-600">une agriculture durable</span>
          </>
        }
        description={
          <>
            Au-delà de nos biopesticides, Sen Biopest vous accompagne avec des services de conseil technique, de recherche et de partenariat pour réussir votre transition vers une agriculture saine et productive.
          </>
        }
      />

      {/* Services */}
      <section className="section-first bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.title} hover className="flex flex-col">
                <CardBody className="flex flex-col flex-1 p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href} className="mt-auto">
                    <Button variant="outline" className="w-full">
                      {service.cta} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaCard
        title="Besoin d'un service sur mesure ?"
        description="Contactez-nous pour discuter de vos besoins spécifiques. Nous construisons des solutions adaptées à chaque situation."
      >
        <Link href="/contact">
          <Button variant="secondary">
            Nous contacter <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/produits">
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            Voir nos produits
          </Button>
        </Link>
      </CtaCard>
    </>
  );
}

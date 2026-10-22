import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Sprout,
  FlaskConical,
  Handshake,
  ArrowRight,
} from 'lucide-react';

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
    href: '/services',
    cta: 'En savoir plus',
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
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="container-wide py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-800">Accueil</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-gray-700">Services</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Un accompagnement complet pour{' '}
              <span className="text-primary-600">une agriculture durable</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Au-delà de nos biopesticides, Sen Biopest vous accompagne avec des services de conseil technique, de recherche et de partenariat pour réussir votre transition vers une agriculture saine et productive.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary-100/40 to-transparent hidden lg:block" />
      </section>

      {/* Services */}
      <section className="section-padding bg-white">
        <div className="container-wide space-y-16">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="inline-flex items-center gap-2 text-primary-600 mb-4">
                  <service.icon className="w-6 h-6" />
                  <span className="text-sm font-medium uppercase tracking-wide">Service</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{service.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                <ul className="space-y-3 mb-8">
                  {service.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={service.href}>
                  <Button>
                    {service.cta} <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <Card className="border-0 shadow-none">
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-12 flex items-center justify-center min-h-[300px]">
                    <service.icon className="w-28 h-28 text-primary-200" />
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-wide text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Besoin d'un service sur mesure ?
          </h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-8">
            Contactez-nous pour discuter de vos besoins spécifiques. Nous construisons des solutions adaptées à chaque situation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Nous contacter <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/produits">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Voir nos produits
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

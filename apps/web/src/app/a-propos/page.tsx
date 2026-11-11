import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Leaf,
  Eye,
  Target,
  MapPin,
  HandCoins,
  Recycle,
  Users,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { CtaCard } from '@/components/ui/cta-card';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Découvrez Sen Biopest : notre mission, notre vision et nos valeurs. Biopesticides naturels à base de plantes locales sénégalaises pour une agriculture durable.',
  openGraph: {
    title: 'À propos de Sen Biopest',
    description:
      'Sen Biopest développe des biopesticides naturels à partir de plantes locales du Sénégal. Découvrez notre engagement pour une agriculture durable et accessible.',
  },
};

const values = [
  {
    icon: Leaf,
    title: 'Naturel',
    description:
      'Nos produits sont formulés exclusivement à partir d\'ingrédients naturels, sans aucun composant chimique de synthèse. Nous respectons la santé des producteurs, des consommateurs et des écosystèmes.',
  },
  {
    icon: MapPin,
    title: 'Local',
    description:
      'Nous valorisons les plantes locales du Sénégal et de l\'Afrique de l\'Ouest. Notre chaîne de valeur est ancrée dans le territoire, créant de l\'emploi et soutenant les communautés rurales.',
  },
  {
    icon: HandCoins,
    title: 'Accessible',
    description:
      'Nous rendons les biopesticides accessibles à tous les producteurs, y compris les petits exploitants. Des prix justes, des formations gratuites et un accompagnement personnalisé.',
  },
  {
    icon: Recycle,
    title: 'Durable',
    description:
      'Nos solutions s\'inscrivent dans une vision long terme. Elles préservent la fertilité des sols, la biodiversité et contribuent à la souveraineté alimentaire du Sénégal.',
  },
];

const stats = [
  { value: '150', label: 'Producteurs accompagnés' },
  { value: '3', label: 'Régions du Sénégal couvertes' },
  { value: '100%', label: 'Ingrédients naturels et locaux' },
  { value: '60%', label: 'Réduction moyenne des pertes' },
  { value: '10+', label: 'Formulations développées' },
  { value: '50+', label: 'Sessions de formation réalisées' },
];

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <PageHeader
        breadcrumb={[{ label: 'À propos' }]}
        title={
          <>
            Des biopesticides naturels,{' '}
            <span className="text-primary-600">issus du terroir sénégalais</span>
          </>
        }
        description={
          <>
            Née en 2023, Sen Biopest est une entreprise sénégalaise qui fait de la recherche, formule et distribue des biopesticides et des huiles essentielles à base de plantes locales. Notre mission : offrir aux producteurs des alternatives naturelles, efficaces et accessibles aux pesticides chimiques.
          </>
        }
      />

      {/* Vision & Mission: two calm cards, a short label + one-line promise each */}
      <section className="section-first bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="h-full">
              <CardBody className="p-6 sm:p-7 space-y-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </span>
                  Notre vision
                </p>
                <h2 className="text-xl font-bold text-gray-900">Nourrir sans empoisonner</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nous rêvons d'un Sénégal et d'une Afrique de l'Ouest où l'agriculture est productive, saine et respectueuse de l'environnement.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Notre ambition : devenir une référence des biopesticides en Afrique de l'Ouest, en prouvant que la protection naturelle des cultures est efficace et durable.
                </p>
              </CardBody>
            </Card>
            <Card className="h-full">
              <CardBody className="p-6 sm:p-7 space-y-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </span>
                  Notre mission
                </p>
                <h2 className="text-xl font-bold text-gray-900">Protéger vos cultures avec la force des plantes du Sénégal</h2>
                <p className="text-gray-600 leading-relaxed">
                  Développer, produire et distribuer des biopesticides et des huiles essentielles de qualité, formulés à partir de plantes locales. Nous accompagnons les producteurs vers une agriculture biologique grâce à :
                </p>
                <ul className="space-y-2 pt-1">
                  {[
                    'La recherche et l\'innovation sur les plantes locales à potentiel pesticide',
                    'La formulation de produits adaptés aux ravageurs et aux cultures du Sénégal',
                    'La formation et le renforcement des capacités des producteurs',
                    'L\'accompagnement technique personnalisé sur le terrain',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="section-padding bg-gray-50">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Nos valeurs</h2>
            <p className="text-gray-600">
              Quatre piliers guident chacune de nos actions, de la recherche en laboratoire jusqu'au champ du producteur.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <Card key={v.title} className="h-full">
                <CardBody className="p-5 space-y-2">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    <v.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{v.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe + chiffres: one section instead of a text block and a heavy coloured band */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-700">
                <Users className="w-4 h-4" />
                Notre équipe
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Une équipe passionnée par l'agriculture durable
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Sen Biopest a été fondée par des agronomes et chercheurs sénégalais convaincus que les plantes locales recèlent des solutions puissantes pour protéger les cultures. Notre équipe combine expertise scientifique, connaissance du terrain et engagement communautaire.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nous travaillons en étroite collaboration avec les universités, les centres de recherche agricole et les organisations paysannes pour développer des solutions ancrées dans les réalités locales.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-3">Notre impact en chiffres</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-primary-50/70 border border-primary-100 px-4 py-4">
                    <div className="text-2xl font-bold text-primary-700 font-display">{stat.value}</div>
                    <div className="text-xs text-gray-600 mt-1 leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sur le terrain: real photos of the team's work */}
      <section className="pb-12 lg:pb-16 bg-white">
        <div className="container-wide">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">Sur le terrain</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { src: '/images/formation.webp', alt: 'Session de formation avec des productrices', label: 'Formations' },
              { src: '/images/accompagnement.webp', alt: 'Démonstration du port des équipements de protection', label: 'Accompagnement technique' },
              { src: '/images/laboratoire.webp', alt: 'Préparation des extraits de plantes au laboratoire', label: 'Laboratoire' },
              { src: '/images/femmes-formees.webp', alt: 'Groupe de femmes formées par Sen Biopest', label: 'Productrices formées' },
            ].map((photo) => (
              <figure key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-sm font-medium text-white">
                  {photo.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaCard
        title="Engagez-vous pour une agriculture durable"
        description="Que vous soyez producteur, distributeur, chercheur ou institution, rejoignez-nous pour construire ensemble un avenir agricole sain et durable."
      >
        <Link href="/contact">
          <Button variant="secondary">Nous contacter</Button>
        </Link>
        <Link href="/partenariats">
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            Devenir partenaire
          </Button>
        </Link>
      </CtaCard>
    </>
  );
}

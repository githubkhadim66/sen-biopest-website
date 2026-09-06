import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Leaf,
  Eye,
  Target,
  Heart,
  MapPin,
  HandCoins,
  Recycle,
  Users,
  TreePine,
  ArrowRight,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'A propos',
  description:
    'Découvrez Sen Biopest : notre mission, notre vision et nos valeurs. Biopesticides naturels à base de plantes locales sénégalaises pour une agriculture durable.',
  openGraph: {
    title: 'A propos de Sen Biopest',
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
  { value: '500+', label: 'Producteurs accompagnés' },
  { value: '14', label: 'Régions du Sénégal couvertes' },
  { value: '100%', label: 'Ingrédients naturels et locaux' },
  { value: '30%', label: 'Réduction moyenne des pertes' },
  { value: '10+', label: 'Formulations développées' },
  { value: '50+', label: 'Sessions de formation réalisées' },
];

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-green-50 overflow-hidden">
        <div className="container-wide py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
              <Leaf className="w-4 h-4" />
              Qui sommes-nous
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Des biopesticides naturels,{' '}
              <span className="text-primary-600">issus du terroir sénégalais</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Sen Biopest est une entreprise sénégalaise dédiée à la recherche, la formulation et la distribution de biopesticides à base de plantes locales. Notre mission : offrir aux producteurs des alternatives naturelles, efficaces et accessibles aux pesticides chimiques.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary-100/40 to-transparent hidden lg:block" />
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary-600">
                <Eye className="w-6 h-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Notre vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Un Sénégal et une Afrique de l'Ouest où l'agriculture est productive, saine et respectueuse de l'environnement. Nous croyons en un modèle agricole qui nourrit les populations sans empoisonner les sols, l'eau ni les producteurs.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nous aspirons à devenir le leader des biopesticides en Afrique de l'Ouest, en prouvant que la protection naturelle des cultures est non seulement possible, mais plus performante et durable que les solutions chimiques.
              </p>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary-600">
                <Target className="w-6 h-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Notre mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Développer, produire et distribuer des biopesticides de qualité, formulés à partir des plantes du terroir sénégalais. Nous accompagnons les producteurs dans leur transition vers une agriculture biologique à travers :
              </p>
              <ul className="space-y-3">
                {[
                  'La recherche et l\'innovation sur les plantes locales à potentiel pesticide',
                  'La formulation de produits adaptés aux ravageurs et cultures du Sénégal',
                  'La formation et le renforcement de capacités des producteurs',
                  'L\'accompagnement technique personnalisé sur le terrain',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <Heart className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="section-padding bg-gray-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Nos valeurs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quatre piliers guident chacune de nos actions, de la recherche en laboratoire jusqu'au champ du producteur.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <Card key={v.title} hover>
                <CardBody className="text-center space-y-4">
                  <div className="mx-auto w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                    <v.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{v.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe / Fondateur */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8 flex items-center justify-center min-h-[350px]">
              <Users className="w-32 h-32 text-primary-200" />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-700 text-sm font-medium px-3 py-1 rounded-full">
                <Award className="w-4 h-4" />
                Notre equipe
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Une equipe passionnee par l'agriculture durable
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Sen Biopest a ete fondee par des agronomes et chercheurs sénégalais convaincus que les plantes locales recèlent des solutions puissantes pour protéger les cultures. Notre équipe combine expertise scientifique, connaissance du terrain et engagement communautaire.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nous travaillons en étroite collaboration avec les universités, les centres de recherche agricole et les organisations paysannes pour développer des solutions ancrées dans les réalités locales.
              </p>
              <Link href="/contact">
                <Button>
                  Rejoindre notre réseau <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact en chiffres */}
      <section className="section-padding bg-primary-700 text-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Notre impact en chiffres</h2>
            <p className="text-primary-100 max-w-2xl mx-auto">
              Des résultats concrets mesurés sur le terrain, auprès des producteurs et pour l'environnement.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-secondary-400 mb-1">{stat.value}</div>
                <div className="text-sm text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-wide text-center">
          <TreePine className="w-12 h-12 mx-auto mb-6 text-primary-200" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Engagez-vous pour une agriculture durable
          </h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-8">
            Que vous soyez producteur, distributeur, chercheur ou institution, rejoignez-nous pour construire ensemble un avenir agricole sain et durable.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Nous contacter
              </Button>
            </Link>
            <Link href="/partenariats">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Devenir partenaire
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

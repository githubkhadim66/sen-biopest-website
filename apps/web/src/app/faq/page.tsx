'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Search,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const staticFaqs: FaqItem[] = [
  {
    id: '1',
    category: 'Produits',
    question: 'Qu\'est-ce qu\'un biopesticide ?',
    answer: 'Un biopesticide est un produit de protection des plantes fabriqué à partir d\'organismes vivants ou de substances naturelles (plantes, minéraux). Contrairement aux pesticides chimiques de synthèse, les biopesticides sont respectueux de l\'environnement, de la santé des producteurs et des consommateurs.',
  },
  {
    id: '2',
    category: 'Produits',
    question: 'Quels types de ravageurs vos produits combattent-ils ?',
    answer: 'Nos biopesticides sont efficaces contre les principaux ravageurs du maraîchage et de l\'agriculture au Sénégal : pucerons, chenilles, mouches blanches, acariens, thrips, ainsi que certaines maladies fongiques. Chaque produit cible des ravageurs spécifiques.',
  },
  {
    id: '3',
    category: 'Produits',
    question: 'Vos produits sont-ils certifiés biologiques ?',
    answer: 'Nos produits sont formulés à partir d\'ingrédients 100% naturels. Nous travaillons avec les autorités compétentes pour obtenir les certifications et homologations nécessaires. Contactez-nous pour connaître le statut de certification de chaque produit.',
  },
  {
    id: '4',
    category: 'Commandes & Livraison',
    question: 'Comment commander vos produits ?',
    answer: 'Vous pouvez commander directement via notre formulaire de contact, par WhatsApp ou par téléphone. Nous vous répondrons sous 24h avec un devis personnalisé adapté à vos besoins.',
  },
  {
    id: '5',
    category: 'Commandes & Livraison',
    question: 'Livrez-vous dans tout le Sénégal ?',
    answer: 'Oui, nous livrons dans les 14 régions du Sénégal. Les délais varient de 24h à 72h selon la zone. Pour les grandes quantités et les commandes régulières, nous proposons des conditions de livraison avantageuses.',
  },
  {
    id: '6',
    category: 'Commandes & Livraison',
    question: 'Quels sont vos moyens de paiement ?',
    answer: 'Nous acceptons le paiement par virement bancaire, Orange Money, Wave et le paiement à la livraison (sous conditions). Pour les commandes institutionnelles, nous proposons des facilités de paiement.',
  },
  {
    id: '7',
    category: 'Utilisation',
    question: 'Comment appliquer vos biopesticides ?',
    answer: 'Chaque produit est livré avec une fiche technique détaillée indiquant les dosages, la fréquence et les méthodes d\'application. Nous proposons aussi des sessions de formation pratique et un accompagnement technique personnalisé.',
  },
  {
    id: '8',
    category: 'Utilisation',
    question: 'Les biopesticides sont-ils compatibles avec l\'agriculture conventionnelle ?',
    answer: 'Oui, nos biopesticides peuvent être utilisés en complément de pratiques conventionnelles dans une approche de lutte intégrée. Ils sont particulièrement adaptés pour réduire progressivement l\'usage de produits chimiques.',
  },
  {
    id: '9',
    category: 'Formation & Accompagnement',
    question: 'Proposez-vous des formations ?',
    answer: 'Oui, nous organisons régulièrement des sessions de formation sur l\'utilisation des biopesticides, les bonnes pratiques agricoles et la lutte intégrée. Formations disponibles en présentiel et en ligne, pour individuels et groupements.',
  },
  {
    id: '10',
    category: 'Formation & Accompagnement',
    question: 'Comment bénéficier d\'un accompagnement technique ?',
    answer: 'Contactez-nous via WhatsApp, téléphone ou le formulaire de contact. Décrivez votre problème (photos bienvenues) et nos agronomes vous proposeront un diagnostic et des recommandations adaptées. Le premier conseil est gratuit.',
  },
  {
    id: '11',
    category: 'Partenariats',
    question: 'Comment devenir distributeur Sen Biopest ?',
    answer: 'Nous recherchons des distributeurs dans toutes les régions du Sénégal et en Afrique de l\'Ouest. Rendez-vous sur notre page Partenariats ou contactez-nous pour discuter des conditions de collaboration.',
  },
  {
    id: '12',
    category: 'Partenariats',
    question: 'Travaillez-vous avec des institutions et ONG ?',
    answer: 'Oui, nous collaborons activement avec des institutions publiques, des ONG et des programmes de développement agricole. Nous pouvons adapter nos produits et services aux besoins spécifiques de vos programmes.',
  },
];

export default function FaqPage() {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  const [faqs, setFaqs] = useState<FaqItem[]>(staticFaqs);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<(Omit<FaqItem, 'category'> & { category: string | null })[]>('/content/faqs')
      .then((items) => {
        if (items.length > 0) {
          setFaqs(items.map((f) => ({ ...f, category: f.category || 'Général' })));
        }
      })
      .catch(() => {
        // Keep static FAQs on error
      });
  }, []);

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = categories
    .filter((cat) => !activeCategory || cat === activeCategory)
    .map((cat) => ({
      category: cat,
      items: filteredFaqs.filter((f) => f.category === cat),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-green-50 overflow-hidden">
        <div className="container-wide py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-800">Accueil</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-gray-700">FAQ</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Questions fréquentes
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Retrouvez les réponses aux questions les plus posées sur nos produits, services et modes de collaboration.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary-100/40 to-transparent hidden lg:block" />
      </section>

      {/* Search & Filter */}
      <section className="section-padding bg-white">
        <div className="container-narrow">
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Groups */}
          <div className="space-y-10">
            {groupedFaqs.map((group) => (
              <div key={group.category}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.items.map((faq) => (
                    <details
                      key={faq.id}
                      className="bg-white rounded-lg border border-gray-200 group"
                    >
                      <summary className="px-5 py-4 cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                        {faq.question}
                        <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-4" />
                      </summary>
                      <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune question ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gray-50">
        <div className="container-narrow text-center">
          <MessageCircle className="w-12 h-12 text-primary-300 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Notre équipe est disponible pour répondre à toutes vos questions. Contactez-nous par formulaire, téléphone ou WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button size="lg">Nous contacter</Button>
            </Link>
            <a
              href={getWhatsAppUrl(
                WHATSAPP_NUMBER,
                'Bonjour Sen Biopest, j\'ai une question.'
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="whatsapp" size="lg">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Handshake,
  ArrowRight,
  Sprout,
  FlaskConical,
  HeartHandshake,
  Phone,
  ChevronRight,
  Star,
  GraduationCap,
  Quote,
  ChevronDown,
} from 'lucide-react';
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from '@/components/ui/animations';
import { BrandEmblem } from '@/components/ui/brand-logo';
import { ProductPhoto } from '@/components/ui/product-photo';

// Real photos from Unsplash — agriculture, Africa, crops
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

interface FeaturedProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  primaryImage: string | null;
  images: { id: string; url: string }[];
  isFeatured: boolean;
  crops: string[];
  pests: string[];
}

interface Testimonial {
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number;
}

// Shown until testimonials are managed from the back-office
const FALLBACK_TESTIMONIALS: Testimonial[] = [
              { name: 'Mamadou Diallo', role: 'Producteur maraîcher', location: 'Thiès', text: 'Depuis que j\'utilise AromaProtect, mes tomates sont mieux protégées et je n\'utilise plus de produits chimiques. Mes clients apprécient la qualité de mes récoltes.', rating: 5 },
              { name: 'Fatou Sow', role: 'Présidente GIE Teranga', location: 'Kaolack', text: 'Sen Biopest a formé nos membres et nous a accompagnés avec des solutions adaptées. Nos récoltes sont meilleures et nos coûts ont baissé.', rating: 5 },
              { name: 'Ibrahima Ndiaye', role: 'Jardinier urbain', location: 'Dakar', text: 'Des produits simples à utiliser et vraiment efficaces. Je recommande Sen Biopest à tous les jardiniers qui veulent protéger leurs plantes naturellement.', rating: 4 },
            ];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    api.get<{ data: FeaturedProduct[] }>('/products?limit=6')
      .then((res) => setFeaturedProducts(res.data || []))
      .catch(() => {});
    api
      .get<{ authorName: string; authorRole: string | null; authorLocation: string | null; content: string; rating: number | null }[]>('/content/testimonials')
      .then((items) => {
        if (items.length === 0) return;
        setTestimonials(
          items.slice(0, 3).map((t) => ({
            name: t.authorName,
            role: t.authorRole || '',
            location: t.authorLocation || '',
            text: t.content,
            rating: t.rating ?? 5,
          })),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.hero}
            alt="Champ agricole au Sénégal"
            fill
            className="object-cover hero-zoom"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/30" />
        </div>

        <div className="container-wide relative z-10 py-16 lg:py-20">
          <div className="max-w-3xl">
            <FadeInUp delay={0.1}>
              <p className="text-sm font-medium text-secondary-300 mb-6">
                Biopesticides à base de plantes locales — Sénégal
              </p>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-6">
                Protégez vos cultures{' '}
                <span className="text-secondary-400">naturellement</span>
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <p className="text-base sm:text-lg text-gray-200 mb-10 max-w-2xl leading-relaxed">
                Des biopesticides et huiles essentielles issus des plantes du Sénégal,
                pour de meilleurs rendements et un sol préservé.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.7}>
              <div className="flex flex-wrap gap-4">
                  <Link href="/produits">
                    <Button size="lg" className="text-base px-8 py-4">
                      Découvrir nos produits <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="text-base px-8 py-4 border-white/30 text-white hover:bg-white/10">
                      Demander un devis
                    </Button>
                  </Link>
              </div>
            </FadeInUp>
          </div>
        </div>

        {/* Scroll hint */}
        <a
          href="#produits-phares"
          aria-label="Faire défiler vers les produits"
          className="scroll-hint absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1 text-white/80 hover:text-white"
        >
          <span className="text-xs tracking-wide">Découvrir</span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* ============ PRODUITS PHARES ============ */}
      <section id="produits-phares" className="section-padding bg-white overflow-hidden scroll-mt-16">
        <div className="container-wide">
          <FadeInUp>
            <div className="mb-8 lg:mb-10 max-w-2xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Produits phares</h2>
              <p className="text-gray-600">
                Des biopesticides formulés à partir de plantes locales sénégalaises, testés et approuvés par les producteurs.
              </p>
            </div>
          </FadeInUp>

          {featuredProducts.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 3).map((product) => {
                const imageUrl = product.primaryImage || product.images?.[0]?.url;
                return (
                  <StaggerItem key={product.id}>
                    <div className="h-full">
                      <Card hover className={`overflow-hidden h-full flex flex-col ${product.isFeatured ? 'border-primary-200 ring-2 ring-primary-100' : ''}`}>
                        <Link
                          href={`/produits/${product.slug}`}
                          aria-label={`Voir la fiche ${product.name}`}
                          className="group relative block h-56 overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50"
                        >
                          {imageUrl ? (
                            <ProductPhoto src={resolveImageUrl(imageUrl)} alt={product.name} />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BrandEmblem size={64} className="opacity-25 grayscale-[30%]" />
                            </div>
                          )}
                          {product.isFeatured && (
                            <span className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              Produit phare
                            </span>
                          )}
                        </Link>
                        <CardBody className="p-5 flex flex-col flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                            {product.shortDescription}
                          </p>
                          {product.pests.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {product.pests.slice(0, 3).map((pest) => (
                                <span key={pest} className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-md">
                                  {pest}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-auto pt-1">
                            <Link href={`/produits/${product.slug}`} className="flex-1">
                              <Button size="sm" className="w-full">Voir la fiche</Button>
                            </Link>
                            <Link href="/contact">
                              <Button size="sm" variant="outline">Devis</Button>
                            </Link>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-56 bg-gray-200" />
                  <CardBody className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-9 bg-gray-200 rounded w-full mt-4" />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          <FadeInUp delay={0.3}>
            <div className="text-center mt-12">
                <Link href="/produits">
                  <Button variant="ghost" size="lg">
                    Voir tout le catalogue <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="section-padding bg-gray-50 overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="mb-8 lg:mb-10 max-w-2xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Nos services</h2>
              <p className="text-gray-600">
                Au-delà des produits, Sen Biopest accompagne les producteurs avec des services complets.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sprout, title: 'Accompagnement technique', desc: 'Diagnostic et conseil personnalisé pour vos cultures.', href: '/accompagnement-technique', img: '/images/accompagnement.webp' },
              { icon: GraduationCap, title: 'Formation', desc: 'Sessions pratiques sur les bonnes pratiques agricoles.', href: '/formations', img: '/images/formation.webp' },
              { icon: FlaskConical, title: 'Recherche & Innovation', desc: 'Nouvelles formulations à base de plantes locales.', href: '/services', img: '/images/laboratoire.webp' },
              { icon: Handshake, title: 'Partenariats', desc: 'Collaboration avec distributeurs et institutions.', href: '/partenariats', img: '/images/femmes-formees.webp' },
            ].map((s) => (
              <StaggerItem key={s.title}>
                <Link href={s.href}>
                  <div>
                    <Card hover className="h-full overflow-hidden group">
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={s.img}
                          alt={s.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <s.icon className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <CardBody className="p-5">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{s.title}</h3>
                        <p className="text-sm text-gray-600">{s.desc}</p>
                      </CardBody>
                    </Card>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ IMPACTS ============ */}
      <section className="py-10 lg:py-12 bg-white border-y border-gray-100">
        <div className="container-wide">
          <h2 className="sr-only">Notre impact</h2>
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: '150', label: 'Producteurs accompagnés' },
              { value: '3', label: 'Régions couvertes' },
              { value: '100%', label: 'Ingrédients naturels' },
              { value: '60%', label: 'Réduction des pertes' },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="rounded-xl bg-primary-50/70 border border-primary-100 px-4 py-4 text-center">
                  <CountUp value={stat.value} className="block text-2xl sm:text-3xl font-bold text-primary-700 font-display" />
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ COMMENT CA MARCHE ============ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="mb-8 lg:mb-10 max-w-2xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            </div>
          </FadeInUp>

          <div className="relative">

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: '01', title: 'Identifiez votre besoin', desc: 'Consultez notre catalogue, filtrez par culture ou ravageur et trouvez le produit adapté.' },
                { step: '02', title: 'Demandez un devis', desc: 'Remplissez notre formulaire ou contactez-nous via WhatsApp. Réponse sous 24h.' },
                { step: '03', title: 'Recevez & appliquez', desc: 'Nous vous livrons et vous accompagnons avec des conseils personnalisés.' },
              ].map((item) => (
                <StaggerItem key={item.step}>
                  <div
                    className="text-center relative"
                  >
                    <div className="text-3xl font-bold text-primary-600 mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ============ PARTENARIATS ============ */}
      <section className="relative py-14 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/femmes-formees.webp"
            alt="Productrices formées par Sen Biopest"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-900/90 to-earth-800/80" />
        </div>

        <div className="container-wide relative z-10 text-center">
          <FadeInUp>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Devenez partenaire</h2>
            <p className="text-earth-100 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
              Fournisseurs, distributeurs, institutions, programmes : collaborons pour une agriculture durable au Sénégal et en Afrique de l&apos;Ouest.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {['Distributeurs', 'Institutions', 'Laboratoires', 'Programmes', 'Financeurs'].map((type) => (
                <span key={type} className="text-white/90 text-sm px-3 py-1.5 rounded-md border border-white/25">
                  {type}
                </span>
              ))}
            </div>
          </FadeInUp>

          <FadeInUp delay={0.5}>
              <Link href="/partenariats">
                <Button size="lg" className="text-base px-8">
                  <HeartHandshake className="w-5 h-5" /> Proposer un partenariat
                </Button>
              </Link>
          </FadeInUp>
        </div>
      </section>

      {/* ============ TEMOIGNAGES ============ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="mb-8 lg:mb-10 max-w-2xl mx-auto text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            </div>
          </FadeInUp>

          {/* Wrapping row centred as a group: 1, 2 or an incomplete last row never hug the left edge */}
          <StaggerContainer className="flex flex-wrap justify-center gap-6">
            {testimonials.map((t, index) => (
              <StaggerItem key={`${t.name}-${index}`} className="min-w-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-md">
                <div className="h-full">
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardBody className="p-6 sm:p-8 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <Quote className="w-8 h-8 text-primary-100 mb-3" />
                      <p className="text-gray-700 mb-6 leading-relaxed italic break-words [overflow-wrap:anywhere] line-clamp-[8] flex-1">&ldquo;{t.text}&rdquo;</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(t.name.trim()[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 break-words">{t.name}</p>
                          <p className="text-xs text-gray-500 break-words">{[t.role, t.location].filter(Boolean).join(' — ')}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ FAQ COURTE ============ */}
      <section className="section-padding bg-gray-50 overflow-hidden">
        <div className="container-narrow">
          <FadeInUp>
            <div className="text-center mb-8 lg:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            </div>
          </FadeInUp>

          <StaggerContainer className="space-y-4">
            {[
              { q: 'Qu\'est-ce qu\'un biopesticide ?', a: 'Un biopesticide est un produit de protection des plantes fabriqué à partir d\'organismes vivants ou de substances naturelles. Contrairement aux pesticides chimiques, ils sont respectueux de l\'environnement et de la santé.' },
              { q: 'Comment commander vos produits ?', a: 'Vous pouvez nous contacter via le formulaire de devis, par WhatsApp ou par téléphone. Nous vous répondrons sous 24h avec une proposition adaptée.' },
              { q: 'Livrez-vous dans tout le Sénégal ?', a: 'Oui, nous livrons dans les 14 régions du Sénégal. Les délais et conditions varient selon la zone. Contactez-nous pour plus de détails.' },
            ].map((faq) => (
              <StaggerItem key={faq.q}>
                <details
                  className="bg-white rounded-xl border border-gray-200 group shadow-sm hover:shadow-md transition-shadow"
                >
                  <summary className="px-6 py-5 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-4" />
                  </summary>
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInUp delay={0.2}>
            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="ghost" size="lg">Voir toutes les FAQ <ChevronRight className="w-4 h-4" /></Button>
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/produits.webp"
            alt="Flacons d'huile essentielle d'eucalyptus Sen Biopest"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700/90 to-primary-900/90" />
        </div>

        <div className="container-wide relative z-10 text-center">
          <FadeInUp>
            <h2 className="text-2xl sm:text-[1.75rem] font-bold text-white mb-6">
              Prêt à protéger vos cultures naturellement ?
            </h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-primary-100 max-w-xl mx-auto mb-8 leading-relaxed">
              Contactez-nous dès maintenant pour un devis gratuit ou un conseil personnalisé.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button variant="secondary" size="lg" className="text-base px-8 py-4">
                    <Phone className="w-5 h-5" /> Demander un devis
                  </Button>
                </Link>
                <Link href="/produits">
                  <Button variant="outline" size="lg" className="text-base px-8 py-4 border-white/30 text-white hover:bg-white/10">
                    Voir nos produits <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}

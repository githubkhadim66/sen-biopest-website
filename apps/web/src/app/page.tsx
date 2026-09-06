'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Leaf,
  Shield,
  Users,
  Handshake,
  ArrowRight,
  CheckCircle,
  Sprout,
  FlaskConical,
  HeartHandshake,
  MessageCircle,
  Phone,
  ChevronRight,
  Star,
  GraduationCap,
  TrendingUp,
  MapPin,
  Quote,
} from 'lucide-react';
import {
  FadeInUp,
  FadeInFrom,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  FloatingElement,
  MagneticWrapper,
  GradientText,
  ParallaxImage,
  RevealLine,
} from '@/components/ui/animations';
import { motion } from 'framer-motion';

// Real photos from Unsplash — agriculture, Africa, crops
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80',
  tomatoes: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80',
  farmer: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
  crops: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  neem: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  field: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&q=80',
  greenhouse: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
  hands: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  spray: 'https://images.unsplash.com/photo-1586771107445-b3e7eb5e1638?w=800&q=80',
  training: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80',
  partnership: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
  leaf: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
  market: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    api.get<{ data: FeaturedProduct[] }>('/products?limit=6')
      .then((res) => setFeaturedProducts(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.hero}
            alt="Champ agricole au Sénégal"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/30" />
        </div>

        {/* Floating decorative elements */}
        <FloatingElement className="absolute top-20 right-20 hidden xl:block z-10" amplitude={15} duration={6}>
          <div className="w-20 h-20 bg-primary-500/20 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-32 right-40 hidden xl:block z-10" amplitude={10} duration={5}>
          <div className="w-14 h-14 bg-secondary-400/20 rounded-full blur-lg" />
        </FloatingElement>

        <div className="container-wide relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl">
            <FadeInUp delay={0.1}>
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <Leaf className="w-4 h-4 text-primary-400" />
                Biopesticides naturels du Sénégal
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              </motion.div>
            </FadeInUp>

            <RevealLine delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6">
                Protégez vos cultures{' '}
                <GradientText className="font-extrabold">naturellement</GradientText>
              </h1>
            </RevealLine>

            <FadeInUp delay={0.5}>
              <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed">
                Sen Biopest développe des solutions biologiques efficaces contre les ravageurs,
                à base de plantes locales sénégalaises. Pour une agriculture saine, durable et rentable.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.7}>
              <div className="flex flex-wrap gap-4">
                <MagneticWrapper>
                  <Link href="/produits">
                    <Button size="lg" className="text-base px-8 py-4 shadow-xl shadow-primary-600/30">
                      Découvrir nos produits <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="text-base px-8 py-4 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                      Demander un devis
                    </Button>
                  </Link>
                </MagneticWrapper>
              </div>
            </FadeInUp>

            {/* Trust bar */}
            <FadeInUp delay={0.9}>
              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-400" />
                  <span>100% naturel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-400" />
                  <span>Fabriqué au Sénégal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-400" />
                  <span>500+ producteurs</span>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ============ PRODUITS PHARES ============ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Nos solutions</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Produits phares</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
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
                    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }} className="h-full">
                      <Card hover className={`overflow-hidden h-full ${product.isFeatured ? 'border-primary-200 ring-2 ring-primary-100' : ''}`}>
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-50 to-green-50">
                          {imageUrl ? (
                            <img
                              src={resolveImageUrl(imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Leaf className="w-16 h-16 text-primary-200" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          {product.isFeatured && (
                            <span className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              Produit phare
                            </span>
                          )}
                        </div>
                        <CardBody className="p-6">
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
                          <div className="flex gap-2">
                            <Link href={`/produits/${product.slug}`} className="flex-1">
                              <Button size="sm" className="w-full">Voir la fiche</Button>
                            </Link>
                            <Link href="/contact">
                              <Button size="sm" variant="outline">Devis</Button>
                            </Link>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
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
              <MagneticWrapper className="inline-block">
                <Link href="/produits">
                  <Button variant="ghost" size="lg">
                    Voir tout le catalogue <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
              </MagneticWrapper>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="section-padding bg-gray-50 overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Ce que nous offrons</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Nos services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Au-delà des produits, Sen Biopest accompagne les producteurs avec des services complets.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sprout, title: 'Accompagnement technique', desc: 'Diagnostic et conseil personnalisé pour vos cultures.', href: '/accompagnement-technique', img: IMAGES.farmer },
              { icon: GraduationCap, title: 'Formation', desc: 'Sessions pratiques sur les bonnes pratiques agricoles.', href: '/formations', img: IMAGES.training },
              { icon: FlaskConical, title: 'Recherche & Innovation', desc: 'Nouvelles formulations à base de plantes locales.', href: '/services', img: IMAGES.crops },
              { icon: Handshake, title: 'Partenariats', desc: 'Collaboration avec distributeurs et institutions.', href: '/partenariats', img: IMAGES.partnership },
            ].map((s) => (
              <StaggerItem key={s.title}>
                <Link href={s.href}>
                  <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card hover className="h-full overflow-hidden group">
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={s.img}
                          alt={s.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center">
                          <s.icon className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <CardBody className="p-5">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{s.title}</h3>
                        <p className="text-sm text-gray-600">{s.desc}</p>
                      </CardBody>
                    </Card>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ IMPACTS ============ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.field}
            alt="Champ agricole"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-primary-900/85" />
        </div>

        <div className="container-wide relative z-10">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block text-primary-300 font-semibold text-sm uppercase tracking-wider mb-3">Résultats concrets</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Notre impact</h2>
              <p className="text-primary-100 max-w-2xl mx-auto text-lg">
                Des résultats mesurables pour les producteurs et l&apos;environnement.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 500, suffix: '+', label: 'Producteurs accompagnés', icon: Users },
              { value: 14, suffix: '', label: 'Régions couvertes', icon: MapPin },
              { value: 100, suffix: '%', label: 'Ingrédients naturels', icon: Leaf },
              { value: 30, suffix: '%', label: 'Réduction des pertes', icon: TrendingUp },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-7 h-7 text-primary-300" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-primary-200 font-medium">{stat.label}</div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ COMMENT CA MARCHE ============ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple et rapide</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            </div>
          </FadeInUp>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: '01', title: 'Identifiez votre besoin', desc: 'Consultez notre catalogue, filtrez par culture ou ravageur et trouvez le produit adapté.', icon: '🔍' },
                { step: '02', title: 'Demandez un devis', desc: 'Remplissez notre formulaire ou contactez-nous via WhatsApp. Réponse sous 24h.', icon: '📋' },
                { step: '03', title: 'Recevez & appliquez', desc: 'Nous vous livrons et vous accompagnons avec des conseils personnalisés.', icon: '🌱' },
              ].map((item) => (
                <StaggerItem key={item.step}>
                  <motion.div
                    className="text-center relative"
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ============ ACCOMPAGNEMENT ============ */}
      <section className="section-padding bg-gray-50 overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInFrom direction="left">
              <div>
                <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Expertise terrain</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Accompagnement technique</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  Un problème sur vos cultures ? Nos conseillers vous aident à identifier le ravageur et vous proposent une solution adaptée et naturelle.
                </p>
                <StaggerContainer className="space-y-4 mb-8">
                  {[
                    'Diagnostic personnalisé de vos cultures',
                    'Envoyez des photos pour un avis rapide',
                    'Recommandations d\'application sur mesure',
                    'Suivi de la prise en charge',
                  ].map((item, i) => (
                    <StaggerItem key={item}>
                      <motion.li
                        className="flex items-start gap-3 text-gray-700"
                        whileHover={{ x: 4 }}
                      >
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-primary-600" />
                        </div>
                        {item}
                      </motion.li>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                <MagneticWrapper className="inline-block">
                  <Link href="/accompagnement-technique">
                    <Button size="lg">
                      Demander un accompagnement <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </MagneticWrapper>
              </div>
            </FadeInFrom>

            <FadeInFrom direction="right">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={IMAGES.farmer}
                    alt="Accompagnement technique des producteurs"
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Floating card */}
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Diagnostic rapide</p>
                      <p className="text-xs text-gray-500">Réponse sous 24h</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </FadeInFrom>
          </div>
        </div>
      </section>

      {/* ============ FORMATIONS ============ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInFrom direction="left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={IMAGES.training}
                    alt="Formation sur les biopesticides"
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 bg-primary-600 text-white rounded-xl shadow-xl p-4"
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <GraduationCap className="w-8 h-8" />
                </motion.div>
              </div>
            </FadeInFrom>

            <FadeInFrom direction="right" className="order-1 lg:order-2">
              <div>
                <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Renforcement des capacités</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Formations pratiques</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  Des sessions de formation conçues pour transmettre les bonnes pratiques d&apos;utilisation des biopesticides et de protection intégrée des cultures.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { value: '2 jours', label: 'Sessions pratiques' },
                    { value: 'Gratuit', label: 'Pour coopératives' },
                    { value: '30+', label: 'Participants / session' },
                    { value: '14', label: 'Régions couvertes' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="font-bold text-primary-600 text-lg">{item.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <MagneticWrapper className="inline-block">
                  <Link href="/formations">
                    <Button size="lg">
                      Voir les formations <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </MagneticWrapper>
              </div>
            </FadeInFrom>
          </div>
        </div>
      </section>

      {/* ============ PARTENARIATS ============ */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.partnership}
            alt="Partenariats agricoles"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-900/90 to-earth-800/80" />
        </div>

        <div className="container-wide relative z-10 text-center">
          <FadeInUp>
            <span className="inline-block text-secondary-300 font-semibold text-sm uppercase tracking-wider mb-3">Ensemble, plus loin</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Devenez partenaire</h2>
            <p className="text-earth-100 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
              Fournisseurs, distributeurs, institutions, programmes : collaborons pour une agriculture durable au Sénégal et en Afrique de l&apos;Ouest.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {['Distributeurs', 'Institutions', 'Laboratoires', 'Programmes', 'Financeurs'].map((type) => (
                <span key={type} className="bg-white/10 backdrop-blur text-white text-sm px-4 py-2 rounded-full border border-white/20">
                  {type}
                </span>
              ))}
            </div>
          </FadeInUp>

          <FadeInUp delay={0.5}>
            <MagneticWrapper className="inline-block">
              <Link href="/partenariats">
                <Button size="lg" className="text-base px-8">
                  <HeartHandshake className="w-5 h-5" /> Proposer un partenariat
                </Button>
              </Link>
            </MagneticWrapper>
          </FadeInUp>
        </div>
      </section>

      {/* ============ TEMOIGNAGES ============ */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-wide">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Retours terrain</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Mamadou Diallo', role: 'Producteur maraîcher', location: 'Thiès', text: 'Depuis que j\'utilise AromaProtect, mes tomates sont mieux protégées et je n\'utilise plus de produits chimiques. Mes clients apprécient la qualité de mes récoltes.', rating: 5 },
              { name: 'Fatou Sow', role: 'Présidente GIE Teranga', location: 'Kaolack', text: 'Sen Biopest a formé nos membres et nous a accompagnés avec des solutions adaptées. Nos récoltes sont meilleures et nos coûts ont baissé.', rating: 5 },
              { name: 'Ibrahima Ndiaye', role: 'Jardinier urbain', location: 'Dakar', text: 'Des produits simples à utiliser et vraiment efficaces. Je recommande Sen Biopest à tous les jardiniers qui veulent protéger leurs plantes naturellement.', rating: 4 },
            ].map((t) => (
              <StaggerItem key={t.name}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardBody className="p-8">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <Quote className="w-8 h-8 text-primary-100 mb-3" />
                      <p className="text-gray-700 mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {t.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.role} — {t.location}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ FAQ COURTE ============ */}
      <section className="section-padding bg-gray-50 overflow-hidden">
        <div className="container-narrow">
          <FadeInUp>
            <div className="text-center mb-12">
              <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Besoin d&apos;aide ?</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            </div>
          </FadeInUp>

          <StaggerContainer className="space-y-4">
            {[
              { q: 'Qu\'est-ce qu\'un biopesticide ?', a: 'Un biopesticide est un produit de protection des plantes fabriqué à partir d\'organismes vivants ou de substances naturelles. Contrairement aux pesticides chimiques, ils sont respectueux de l\'environnement et de la santé.' },
              { q: 'Comment commander vos produits ?', a: 'Vous pouvez nous contacter via le formulaire de devis, par WhatsApp ou par téléphone. Nous vous répondrons sous 24h avec une proposition adaptée.' },
              { q: 'Livrez-vous dans tout le Sénégal ?', a: 'Oui, nous livrons dans les 14 régions du Sénégal. Les délais et conditions varient selon la zone. Contactez-nous pour plus de détails.' },
            ].map((faq) => (
              <StaggerItem key={faq.q}>
                <motion.details
                  className="bg-white rounded-xl border border-gray-200 group shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                >
                  <summary className="px-6 py-5 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-4" />
                  </summary>
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
                </motion.details>
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
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.vegetables}
            alt="Légumes frais du maraîchage"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700/90 to-primary-900/90" />
        </div>

        <div className="container-wide relative z-10 text-center">
          <FadeInUp>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à protéger vos cultures naturellement ?
            </h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-primary-100 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              Contactez-nous dès maintenant pour un devis gratuit ou un conseil personnalisé.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticWrapper>
                <Link href="/contact">
                  <Button variant="secondary" size="lg" className="text-base px-8 py-4 shadow-xl">
                    <Phone className="w-5 h-5" /> Demander un devis
                  </Button>
                </Link>
              </MagneticWrapper>
              <MagneticWrapper>
                <Link href="/produits">
                  <Button variant="outline" size="lg" className="text-base px-8 py-4 border-white/30 text-white hover:bg-white/10">
                    Voir nos produits <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </MagneticWrapper>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}

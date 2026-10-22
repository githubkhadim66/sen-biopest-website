'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Leaf,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  FlaskConical,
  Droplets,
  Sprout,
  ShieldAlert,
  Package,
  Wheat,
  Bug,
  Star,
  MessageCircle,
  FileText,
  ShoppingCart,
  HelpCircle,
  ArrowRight,
  ImageOff,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, getWhatsAppUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useSiteSettings } from '@/hooks/use-site-settings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  primaryImage: string | null;
  images: { id: string; url: string; alt?: string; isPrimary: boolean; sortOrder: number }[];
  benefits: string[];
  activeIngredients: string[];
  dosage: string | null;
  applicationMethod: string | null;
  precautions: string | null;
  packaging: string | null;
  availability: 'EN_STOCK' | 'SUR_COMMANDE' | 'RUPTURE';
  crops: string[];
  pests: string[];
  isFeatured: boolean;
  faq: { question: string; answer: string }[];
  relatedProducts: RelatedProduct[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  primaryImage: string | null;
  images: { id: string; url: string }[];
  crops: string[];
  availability: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AVAILABILITY_LABELS: Record<string, string> = {
  EN_STOCK: 'En stock',
  SUR_COMMANDE: 'Sur commande',
  RUPTURE: 'Rupture de stock',
};

const AVAILABILITY_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
  EN_STOCK: 'success',
  SUR_COMMANDE: 'warning',
  RUPTURE: 'danger',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function trackClick(ctaType: string, productSlug?: string) {
  api
    .post('/content/track-click', {
      ctaType,
      page: typeof window !== 'undefined' ? window.location.pathname : '/produits',
      productSlug,
    })
    .catch(() => {});
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Breadcrumb({ productName }: { productName: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
      <Link href="/" className="hover:text-primary-600 transition-colors">
        Accueil
      </Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <Link href="/produits" className="hover:text-primary-600 transition-colors">
        Produits
      </Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-gray-900 font-medium truncate max-w-[200px]">
        {productName}
      </span>
    </nav>
  );
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

function ImageGallery({ images, name }: { images: { id: string; url: string; alt?: string; isPrimary: boolean; sortOrder: number }[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageUrls = images?.map((img) => resolveImageUrl(img.url)) || [];

  if (!images || images.length === 0) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl flex items-center justify-center h-72 sm:h-96">
        <div className="text-center">
          <Leaf className="w-24 h-24 text-primary-200 mx-auto mb-3" />
          <p className="text-sm text-primary-400">Image a venir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="bg-gray-100 rounded-xl overflow-hidden h-72 sm:h-96">
        <img
          src={imageUrls[selectedIndex]}
          alt={`${name} - photo ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Thumbnails */}
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                'w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors',
                i === selectedIndex
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-gray-300',
              )}
            >
              <img
                src={img}
                alt={`${name} miniature ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FAQAccordion({ faq }: { faq: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faq || faq.length === 0) return null;

  return (
    <div className="space-y-3">
      {faq.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span>{item.question}</span>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 shrink-0 transition-transform',
                openIndex === i && 'rotate-180',
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              openIndex === i ? 'max-h-96' : 'max-h-0',
            )}
          >
            <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedProductCard({ product }: { product: RelatedProduct }) {
  return (
    <Card hover className="flex flex-col h-full">
      <div className="h-40 bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center overflow-hidden">
        {(product.primaryImage || (product.images && product.images.length > 0)) ? (
          <img
            src={resolveImageUrl(product.primaryImage || product.images[0]?.url || '')}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Leaf className="w-12 h-12 text-primary-200" />
        )}
      </div>
      <CardBody className="flex flex-col flex-1 gap-2">
        <Link
          href={`/produits/${product.slug}`}
          className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 flex-1">
          {product.shortDescription}
        </p>
        <Link href={`/produits/${product.slug}`} className="mt-auto pt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => trackClick('view_related', product.slug)}
          >
            Voir la fiche <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CTA Block
// ---------------------------------------------------------------------------

function CTABlock({ product }: { product: ProductDetail }) {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const whatsappDevis = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    `Bonjour Sen Biopest, je souhaite un devis pour le produit "${product.name}".`,
  );
  const whatsappConseil = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    `Bonjour Sen Biopest, j'aimerais un conseil technique sur l'utilisation de "${product.name}" sur mes cultures.`,
  );

  const handleAddToCart = () => {
    const imageUrl = product.primaryImage || product.images?.[0]?.url || null;
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      imageUrl,
    });
    trackClick('commander', product.slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-3">
      <Link
        href="/contact"
        className="block"
        onClick={() => trackClick('demander_devis', product.slug)}
      >
        <Button size="lg" className="w-full">
          <FileText className="w-5 h-5" /> Demander un devis
        </Button>
      </Link>

      <button
        className="block w-full"
        onClick={handleAddToCart}
      >
        <Button size="lg" variant="secondary" className="w-full">
          <ShoppingCart className="w-5 h-5" />
          {added ? 'Ajoute au panier !' : 'Ajouter au panier'}
        </Button>
      </button>

      <a
        href={whatsappDevis}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={() => trackClick('whatsapp_product', product.slug)}
      >
        <Button size="lg" variant="whatsapp" className="w-full">
          <MessageCircle className="w-5 h-5" /> WhatsApp
        </Button>
      </a>

      <a
        href={whatsappConseil}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={() => trackClick('demander_conseil', product.slug)}
      >
        <Button size="lg" variant="outline" className="w-full">
          <HelpCircle className="w-5 h-5" /> Demander conseil
        </Button>
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  const { data: product, isLoading, isError, error } = useQuery<ProductDetail>({
    queryKey: ['product', slug],
    queryFn: () => api.get<ProductDetail>(`/products/${slug}`),
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-wide animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="h-96 bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-12 bg-gray-200 rounded w-full mt-8" />
              <div className="h-12 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (isError || !product) {
    return (
      <section className="section-padding bg-white">
        <div className="container-wide text-center py-20">
          <ImageOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Produit introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            {(error as Error)?.message ||
              'Ce produit n\'existe pas ou a ete retire de notre catalogue.'}
          </p>
          <Link href="/produits">
            <Button>Retour au catalogue</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ============ PRODUCT DETAIL ============ */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <Breadcrumb productName={product.name} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Left: Images */}
            <ImageGallery images={product.images} name={product.name} />

            {/* Right: Info */}
            <div className="space-y-6">
              {/* Category & featured */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <Badge variant="info">{product.category?.name}</Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="warning" className="gap-1">
                    <Star className="w-3 h-3" /> Produit phare
                  </Badge>
                )}
                <Badge
                  variant={AVAILABILITY_BADGE[product.availability] ?? 'default'}
                >
                  {AVAILABILITY_LABELS[product.availability] ?? product.availability}
                </Badge>
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Short description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Crops & pests tags */}
              {(product.crops?.length > 0 || product.pests?.length > 0) && (
                <div className="space-y-3">
                  {product.crops?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Cultures ciblees
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {product.crops.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full"
                          >
                            <Wheat className="w-3 h-3" />
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.pests?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Ravageurs / maladies
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {product.pests.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full"
                          >
                            <Bug className="w-3 h-3" />
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CTA buttons */}
              <CTABlock product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FULL DESCRIPTION ============ */}
      {product.description && (
        <section className="section-padding bg-gray-50">
          <div className="container-narrow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Description detaillee
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        </section>
      )}

      {/* ============ BENEFITS ============ */}
      {product.benefits && product.benefits.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-narrow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Avantages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-green-50 rounded-lg p-4"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-800">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ TECHNICAL DETAILS ============ */}
      <section className="section-padding bg-gray-50">
        <div className="container-narrow">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Informations techniques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active ingredients */}
            {product.activeIngredients && product.activeIngredients.length > 0 && (
              <Card>
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2 text-primary-600">
                    <FlaskConical className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-900">
                      Ingredients actifs
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {product.activeIngredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-1.5" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {/* Dosage */}
            {product.dosage && (
              <Card>
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Droplets className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-900">Dosage</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.dosage}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Application method */}
            {product.applicationMethod && (
              <Card>
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Sprout className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-900">
                      Methode d&apos;application
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.applicationMethod}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Packaging */}
            {product.packaging && (
              <Card>
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Package className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-900">
                      Conditionnement
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700">{product.packaging}</p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ============ PRECAUTIONS ============ */}
      {product.precautions && (
        <section className="section-padding bg-white">
          <div className="container-narrow">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Precautions d&apos;emploi
                </h2>
              </div>
              <p className="text-sm text-gray-700">{product.precautions}</p>
            </div>
          </div>
        </section>
      )}

      {/* ============ FAQ ============ */}
      {product.faq && product.faq.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-narrow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions frequentes
            </h2>
            <FAQAccordion faq={product.faq} />
          </div>
        </section>
      )}

      {/* ============ RELATED PRODUCTS ============ */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Produits similaires
              </h2>
              <Link href="/produits">
                <Button variant="ghost" size="sm">
                  Voir tout <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {product.relatedProducts.slice(0, 4).map((rp) => (
                <RelatedProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ BOTTOM CTA ============ */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-wide text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Interesse(e) par {product.name} ?
          </h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-8">
            Contactez-nous pour un devis personnalise, une commande ou un
            conseil d&apos;application. Notre equipe repond sous 24h.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              onClick={() => trackClick('demander_devis_bottom', product.slug)}
            >
              <Button variant="secondary" size="lg">
                <FileText className="w-5 h-5" /> Demander un devis
              </Button>
            </Link>
            <a
              href={getWhatsAppUrl(
                WHATSAPP_NUMBER,
                `Bonjour Sen Biopest, je suis interesse(e) par "${product.name}". Pouvez-vous me donner plus d'informations ?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('whatsapp_bottom', product.slug)}
            >
              <Button variant="whatsapp" size="lg">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </Button>
            </a>
            <Link href="/produits">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Voir tous les produits
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

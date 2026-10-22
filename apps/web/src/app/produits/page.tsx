'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Leaf,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  FileText,
  Star,
  Bug,
  Wheat,
  Package,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, getWhatsAppUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSiteSettings } from '@/hooks/use-site-settings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: { id: string; name: string; slug: string } | null;
  crops: string[];
  pests: string[];
  primaryImage: string | null;
  images: { id: string; url: string; alt?: string; isPrimary: boolean; sortOrder: number }[];
  availability: 'EN_STOCK' | 'SUR_COMMANDE' | 'RUPTURE';
  isFeatured: boolean;
  price?: string;
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PER_PAGE = 12;

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

const AVAILABILITY_OPTIONS = [
  { value: 'EN_STOCK', label: 'En stock' },
  { value: 'SUR_COMMANDE', label: 'Sur commande' },
  { value: 'RUPTURE', label: 'Rupture de stock' },
];

const AVAILABILITY_LABELS: Record<string, string> = {
  EN_STOCK: 'En stock',
  SUR_COMMANDE: 'Sur commande',
  RUPTURE: 'Rupture',
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

function FilterSidebar({
  category,
  crop,
  pest,
  availability,
  onCategoryChange,
  onCropChange,
  onPestChange,
  onAvailabilityChange,
  onReset,
  className,
}: {
  category: string;
  crop: string;
  pest: string;
  availability: string;
  onCategoryChange: (v: string) => void;
  onCropChange: (v: string) => void;
  onPestChange: (v: string) => void;
  onAvailabilityChange: (v: string) => void;
  onReset: () => void;
  className?: string;
}) {
  const { data: categories } = useQuery<{ id: string; name: string; slug: string }[]>({
    queryKey: ['product-categories'],
    queryFn: () => api.get('/products/categories'),
  });
  const { data: crops } = useQuery<{ id: string; name: string; slug: string }[]>({
    queryKey: ['product-crops'],
    queryFn: () => api.get('/products/crops'),
  });
  const { data: pests } = useQuery<{ id: string; name: string; slug: string }[]>({
    queryKey: ['product-pests'],
    queryFn: () => api.get('/products/pests'),
  });

  const categoryOptions = (categories ?? []).map((c) => ({ value: c.slug, label: c.name }));
  const cropOptions = (crops ?? []).map((c) => ({ value: c.slug, label: c.name }));
  const pestOptions = (pests ?? []).map((p) => ({ value: p.slug, label: p.name }));

  const hasFilters = category || crop || pest || availability;

  return (
    <aside className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs text-primary-600 hover:underline"
          >
            Reinitialiser
          </button>
        )}
      </div>

      <Select
        id="filter-category"
        label="Categorie"
        placeholder="Toutes les categories"
        options={categoryOptions}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      />

      <Select
        id="filter-crop"
        label="Culture ciblee"
        placeholder="Toutes les cultures"
        options={cropOptions}
        value={crop}
        onChange={(e) => onCropChange(e.target.value)}
      />

      <Select
        id="filter-pest"
        label="Ravageur / maladie"
        placeholder="Tous les ravageurs"
        options={pestOptions}
        value={pest}
        onChange={(e) => onPestChange(e.target.value)}
      />

      <Select
        id="filter-availability"
        label="Disponibilite"
        placeholder="Toute disponibilite"
        options={AVAILABILITY_OPTIONS}
        value={availability}
        onChange={(e) => onAvailabilityChange(e.target.value)}
      />
    </aside>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  const whatsappUrl = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    `Bonjour Sen Biopest, je suis interesse(e) par le produit "${product.name}". Pouvez-vous me donner plus d'informations ?`,
  );

  return (
    <Card hover className="flex flex-col h-full">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center overflow-hidden">
        {(product.primaryImage || (product.images && product.images.length > 0)) ? (
          <img
            src={resolveImageUrl(product.primaryImage || product.images[0]?.url || '')}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Leaf className="w-16 h-16 text-primary-200" />
        )}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-secondary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3" />
            Produit phare
          </span>
        )}
        <Badge
          variant={AVAILABILITY_BADGE[product.availability] ?? 'default'}
          className="absolute top-3 right-3"
        >
          {AVAILABILITY_LABELS[product.availability] ?? product.availability}
        </Badge>
      </div>

      <CardBody className="flex flex-col flex-1 gap-3">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium text-primary-600">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <Link
          href={`/produits/${product.slug}`}
          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Crops tags */}
        {product.crops && product.crops.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.crops.slice(0, 3).map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
              >
                <Wheat className="w-3 h-3" />
                {c}
              </span>
            ))}
            {product.crops.length > 3 && (
              <span className="text-xs text-gray-400">
                +{product.crops.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link href={`/produits/${product.slug}`} className="flex-1">
            <Button
              size="sm"
              className="w-full"
              onClick={() => trackClick('view_product', product.slug)}
            >
              Voir la fiche
            </Button>
          </Link>
          <Link
            href="/contact"
            onClick={() => trackClick('demander_devis', product.slug)}
          >
            <Button size="sm" variant="outline" title="Demander un devis">
              <FileText className="w-4 h-4" />
            </Button>
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('whatsapp_product', product.slug)}
          >
            <Button size="sm" variant="whatsapp" title="Contacter via WhatsApp">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </CardBody>
    </Card>
  );
}

function FeaturedProductHighlight({ product }: { product: Product }) {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  const whatsappUrl = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    `Bonjour Sen Biopest, je suis interesse(e) par votre produit phare "${product.name}". Pouvez-vous m'en dire plus ?`,
  );

  return (
    <Card className="border-primary-200 ring-1 ring-primary-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="h-56 md:h-auto bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
          {(product.primaryImage || (product.images && product.images.length > 0)) ? (
            <img
              src={resolveImageUrl(product.primaryImage || product.images[0]?.url || '')}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Leaf className="w-24 h-24 text-primary-300" />
          )}
        </div>
        <CardBody className="flex flex-col gap-4 justify-center">
          <div className="inline-flex items-center gap-1.5 self-start bg-secondary-100 text-secondary-700 text-xs font-semibold px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5" />
            Produit phare
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
          <p className="text-gray-600">{product.shortDescription}</p>

          {product.crops && product.crops.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.crops.map((c) => (
                <Badge key={c} variant="info">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Link href={`/produits/${product.slug}`}>
              <Button
                onClick={() => trackClick('view_product', product.slug)}
              >
                Decouvrir <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link
              href="/contact"
              onClick={() => trackClick('demander_devis', product.slug)}
            >
              <Button variant="outline">
                <FileText className="w-4 h-4" /> Demander un devis
              </Button>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('whatsapp_product', product.slug)}
            >
              <Button variant="whatsapp">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
          </div>
        </CardBody>
      </div>
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = [];
    const delta = 1;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    result.push(1);
    if (left > 2) result.push('ellipsis');
    for (let i = left; i <= right; i++) result.push(i);
    if (right < totalPages - 1) result.push('ellipsis');
    if (totalPages > 1) result.push(totalPages);

    return result;
  }, [page, totalPages]);

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Page precedente"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProduitsPage() {
  const { whatsappNumber: WHATSAPP_NUMBER } = useSiteSettings();

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [crop, setCrop] = useState('');
  const [pest, setPest] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PER_PAGE));
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (crop) params.set('crop', crop);
    if (pest) params.set('pest', pest);
    if (availability) params.set('availability', availability);
    return params.toString();
  }, [search, category, crop, pest, availability, page]);

  // Fetch products
  const { data, isLoading, isError, error } = useQuery<ProductsResponse>({
    queryKey: ['products', queryString],
    queryFn: () => api.get<ProductsResponse>(`/products?${queryString}`),
  });

  const products = data?.data ?? [];
  const featuredProduct = products.find((p) => p.isFeatured);

  // Handlers
  const resetFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setCrop('');
    setPest('');
    setAvailability('');
    setPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    },
    [],
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const activeFilterCount = [category, crop, pest, availability].filter(Boolean).length;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-green-50">
        <div className="container-wide py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              <Package className="w-4 h-4" />
              Catalogue produits
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Nos <span className="text-primary-600">biopesticides</span> naturels
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Decouvrez notre gamme de biopesticides a base de plantes locales
              senegalaises. Des solutions naturelles et efficaces pour proteger
              vos cultures.
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <section className="section-padding bg-gray-50">
        <div className="container-wide">
          {/* Search bar */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                id="product-search"
                placeholder="Rechercher un produit, une culture, un ravageur..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-xs">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              {/* Panel */}
              <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-6 shadow-xl ml-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Filtres</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar

                  category={category}
                  crop={crop}
                  pest={pest}
                  availability={availability}
                  onCategoryChange={handleFilterChange(setCategory)}
                  onCropChange={handleFilterChange(setCrop)}
                  onPestChange={handleFilterChange(setPest)}
                  onAvailabilityChange={handleFilterChange(setAvailability)}
                  onReset={() => {
                    resetFilters();
                    setMobileFiltersOpen(false);
                  }}
                />
                <div className="mt-8">
                  <Button
                    className="w-full"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Voir les resultats
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <FilterSidebar
              category={category}
              crop={crop}
              pest={pest}
              availability={availability}
              onCategoryChange={handleFilterChange(setCategory)}
              onCropChange={handleFilterChange(setCrop)}
              onPestChange={handleFilterChange(setPest)}
              onAvailabilityChange={handleFilterChange(setAvailability)}
              onReset={resetFilters}
              className="hidden lg:block w-64 shrink-0"
            />

            {/* Product listing */}
            <div className="flex-1 min-w-0">
              {/* Featured product */}
              {page === 1 && !search && !category && !crop && !pest && !availability && featuredProduct && (
                <div className="mb-8">
                  <FeaturedProductHighlight product={featuredProduct} />
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <CardBody className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="flex gap-2 pt-2">
                          <div className="h-9 bg-gray-200 rounded flex-1" />
                          <div className="h-9 bg-gray-200 rounded w-9" />
                          <div className="h-9 bg-gray-200 rounded w-9" />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="text-center py-16">
                  <Bug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Erreur de chargement
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {(error as Error)?.message ||
                      'Impossible de charger les produits.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Reessayer
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !isError && products.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Aucun produit trouve
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Essayez de modifier vos filtres ou votre recherche.
                  </p>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reinitialiser les filtres
                  </Button>
                </div>
              )}

              {/* Product grid */}
              {!isLoading && !isError && products.length > 0 && (
                <>
                  {/* Results count */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500">
                      {data?.total ?? products.length} produit
                      {(data?.total ?? products.length) > 1 ? 's' : ''} trouve
                      {(data?.total ?? products.length) > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products
                      .filter((p) => !(page === 1 && !search && !category && !crop && !pest && !availability && p.isFeatured))
                      .map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                  </div>

                  {/* Pagination */}
                  {data && data.totalPages > 1 && (
                    <Pagination
                      page={data.page}
                      totalPages={data.totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 bg-primary-600 rounded-2xl text-white p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="text-primary-100 max-w-xl mx-auto mb-6">
              Contactez-nous pour un conseil personnalise ou un devis sur
              mesure. Nous pouvons formuler des solutions adaptees a vos besoins
              specifiques.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                onClick={() => trackClick('demander_devis_catalogue')}
              >
                <Button variant="secondary" size="lg">
                  <FileText className="w-5 h-5" /> Demander un devis
                </Button>
              </Link>
              <a
                href={getWhatsAppUrl(
                  WHATSAPP_NUMBER,
                  'Bonjour Sen Biopest, je souhaite un conseil personnalise sur vos produits.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('whatsapp_catalogue')}
              >
                <Button
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import { Metadata } from 'next';
import ProductDetailClient from './product-detail-client';

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
  relatedProducts: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    primaryImage: string | null;
    images: { id: string; url: string }[];
    crops: string[];
    availability: string;
  }[];
  metaTitle?: string;
  metaDescription?: string;
}

// ---------------------------------------------------------------------------
// SEO — generateMetadata (server-side)
// ---------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Ce produit n\'existe pas ou a ete retire.',
    };
  }

  const title = product.metaTitle || `${product.name} — Biopesticide naturel`;
  const description =
    product.metaDescription ||
    product.shortDescription ||
    `Decouvrez ${product.name}, biopesticide naturel par Sen Biopest. ${product.shortDescription}`;

  const ogImage = product.primaryImage || product.images?.[0]?.url;

  return {
    title,
    description,
    keywords: [
      product.name,
      'biopesticide',
      'Sen Biopest',
      ...product.crops,
      ...product.pests,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_SN',
      siteName: 'Sen Biopest',
      images: ogImage
        ? [{ url: ogImage, alt: product.name }]
        : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Page (server component shell)
// ---------------------------------------------------------------------------

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}

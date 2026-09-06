// ============================================================
// ENUMS (mirror Prisma enums for frontend usage)
// ============================================================

export enum Role {
  ADMIN = 'ADMIN',
  COMMERCIAL = 'COMMERCIAL',
  CONSEILLER = 'CONSEILLER',
}

export enum CommercialRequestType {
  DEVIS = 'DEVIS',
  COMMANDE = 'COMMANDE',
  RAPPEL = 'RAPPEL',
  INFORMATION = 'INFORMATION',
  ECHANTILLON = 'ECHANTILLON',
}

export enum CommercialRequestStatus {
  NOUVEAU = 'NOUVEAU',
  EN_COURS = 'EN_COURS',
  RELANCE = 'RELANCE',
  CONVERTI = 'CONVERTI',
  ANNULE = 'ANNULE',
}

export enum TechnicalRequestStatus {
  NOUVEAU = 'NOUVEAU',
  EN_COURS = 'EN_COURS',
  TRAITE = 'TRAITE',
  CLOTURE = 'CLOTURE',
}

export enum RegistrationStatus {
  INSCRIT = 'INSCRIT',
  CONFIRME = 'CONFIRME',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  ANNULE = 'ANNULE',
}

export enum PartnershipStatus {
  NOUVEAU = 'NOUVEAU',
  QUALIFIE = 'QUALIFIE',
  EN_DISCUSSION = 'EN_DISCUSSION',
  ACCEPTE = 'ACCEPTE',
  REFUSE = 'REFUSE',
}

export enum PartnerType {
  FOURNISSEUR = 'FOURNISSEUR',
  DISTRIBUTEUR = 'DISTRIBUTEUR',
  INSTITUTION = 'INSTITUTION',
  LABORATOIRE = 'LABORATOIRE',
  FINANCEUR = 'FINANCEUR',
  PROGRAMME = 'PROGRAMME',
  ACHETEUR = 'ACHETEUR',
  AUTRE = 'AUTRE',
}

export enum ActorType {
  PRODUCTEUR = 'PRODUCTEUR',
  COOPERATIVE = 'COOPERATIVE',
  GIE = 'GIE',
  JARDINIER = 'JARDINIER',
  INSTITUTION = 'INSTITUTION',
  ENTREPRISE = 'ENTREPRISE',
  PARTICULIER = 'PARTICULIER',
  AUTRE = 'AUTRE',
}

export enum TrainingModality {
  PRESENTIEL = 'PRESENTIEL',
  EN_LIGNE = 'EN_LIGNE',
  HYBRIDE = 'HYBRIDE',
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// PRODUCT TYPES
// ============================================================

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductFaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  availability: string;
  isFeatured: boolean;
  primaryImage: string | null;
  category: { id: string; name: string; slug: string } | null;
  crops: string[];
  pests: string[];
  tags: string[];
}

export interface ProductDetail extends ProductSummary {
  description: string;
  benefits: string[];
  activeIngredients: string[];
  dosage: string | null;
  applicationMethod: string | null;
  precautions: string | null;
  packaging: string | null;
  images: ProductImage[];
  faq: ProductFaqItem[];
  relatedProducts: ProductSummary[];
  metaTitle: string | null;
  metaDescription: string | null;
}

// ============================================================
// TRAINING TYPES
// ============================================================

export interface TrainingSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetAudience: string;
  duration: string | null;
  modality: TrainingModality;
  location: string | null;
  date: string | null;
  endDate: string | null;
  price: string | null;
  maxParticipants: number | null;
  registrationCount: number;
}

export interface TrainingDetail extends TrainingSummary {
  objectives: string[];
  documents: { id: string; title: string; url: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
}

// ============================================================
// FORM SUBMISSION TYPES
// ============================================================

export interface CommercialRequestInput {
  type: CommercialRequestType;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  organization?: string;
  actorType: ActorType;
  locality?: string;
  region?: string;
  productInterest?: string;
  quantity?: string;
  cropConcerned?: string;
  message?: string;
  consent: boolean;
  source?: string;
}

export interface TechnicalRequestInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  organization?: string;
  actorType: ActorType;
  locality?: string;
  region?: string;
  crop: string;
  cropStage?: string;
  symptoms: string;
  description?: string;
  consent: boolean;
}

export interface TrainingRegistrationInput {
  trainingId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  organization?: string;
  actorType: ActorType;
  locality?: string;
  region?: string;
  motivation?: string;
  consent: boolean;
}

export interface PartnershipRequestInput {
  partnerType: PartnerType;
  organizationName: string;
  contactName: string;
  phone: string;
  email?: string;
  website?: string;
  locality?: string;
  region?: string;
  proposal: string;
  objectives?: string;
  consent: boolean;
}

export interface ContactRequestInput {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  consent: boolean;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  commercialRequests: {
    total: number;
    byStatus: Record<CommercialRequestStatus, number>;
    thisMonth: number;
    converted: number;
  };
  technicalRequests: {
    total: number;
    byStatus: Record<TechnicalRequestStatus, number>;
    thisMonth: number;
  };
  trainingRegistrations: {
    total: number;
    thisMonth: number;
  };
  partnershipRequests: {
    total: number;
    thisMonth: number;
  };
  ctaClicks: {
    whatsapp: number;
    devis: number;
    total: number;
  };
  recentRequests: Array<{
    id: string;
    type: string;
    name: string;
    date: string;
    status: string;
  }>;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// ============================================================
// CMS TYPES
// ============================================================

export interface ContentBlockData {
  key: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  metadata: Record<string, unknown> | null;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export interface TestimonialData {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorLocation: string | null;
  content: string;
  imageUrl: string | null;
  rating: number | null;
}

// ============================================================
// SENEGAL REGIONS
// ============================================================

export const SENEGAL_REGIONS = [
  'Dakar',
  'Diourbel',
  'Fatick',
  'Kaffrine',
  'Kaolack',
  'Kédougou',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Tambacounda',
  'Thiès',
  'Ziguinchor',
] as const;

export type SenegalRegion = (typeof SENEGAL_REGIONS)[number];

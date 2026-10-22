-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COMMERCIAL', 'CONSEILLER');

-- CreateEnum
CREATE TYPE "CommercialRequestType" AS ENUM ('DEVIS', 'COMMANDE', 'RAPPEL', 'INFORMATION', 'ECHANTILLON');

-- CreateEnum
CREATE TYPE "CommercialRequestStatus" AS ENUM ('NOUVEAU', 'EN_COURS', 'RELANCE', 'CONVERTI', 'ANNULE');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('PRODUCTEUR', 'COOPERATIVE', 'GIE', 'JARDINIER', 'INSTITUTION', 'ENTREPRISE', 'PARTICULIER', 'AUTRE');

-- CreateEnum
CREATE TYPE "TechnicalRequestStatus" AS ENUM ('NOUVEAU', 'EN_COURS', 'TRAITE', 'CLOTURE');

-- CreateEnum
CREATE TYPE "TrainingModality" AS ENUM ('PRESENTIEL', 'EN_LIGNE', 'HYBRIDE');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('INSCRIT', 'CONFIRME', 'PRESENT', 'ABSENT', 'ANNULE');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('FOURNISSEUR', 'DISTRIBUTEUR', 'INSTITUTION', 'LABORATOIRE', 'FINANCEUR', 'PROGRAMME', 'ACHETEUR', 'AUTRE');

-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('NOUVEAU', 'QUALIFIE', 'EN_DISCUSSION', 'ACCEPTE', 'REFUSE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COMMERCIAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT[],
    "active_ingredients" TEXT[],
    "dosage" TEXT,
    "application_method" TEXT,
    "precautions" TEXT,
    "packaging" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'EN_STOCK',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_on_products" (
    "product_id" TEXT NOT NULL,
    "crop_id" TEXT NOT NULL,

    CONSTRAINT "crop_on_products_pkey" PRIMARY KEY ("product_id","crop_id")
);

-- CreateTable
CREATE TABLE "pests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "pests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pest_on_products" (
    "product_id" TEXT NOT NULL,
    "pest_id" TEXT NOT NULL,

    CONSTRAINT "pest_on_products_pkey" PRIMARY KEY ("product_id","pest_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_on_products" (
    "product_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "tag_on_products_pkey" PRIMARY KEY ("product_id","tag_id")
);

-- CreateTable
CREATE TABLE "commercial_requests" (
    "id" TEXT NOT NULL,
    "type" "CommercialRequestType" NOT NULL,
    "status" "CommercialRequestStatus" NOT NULL DEFAULT 'NOUVEAU',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "organization" TEXT,
    "actor_type" "ActorType" NOT NULL DEFAULT 'PRODUCTEUR',
    "locality" TEXT,
    "region" TEXT,
    "product_interest" TEXT,
    "quantity" TEXT,
    "crop_concerned" TEXT,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_to_id" TEXT,

    CONSTRAINT "commercial_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_request_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "commercial_request_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_requests" (
    "id" TEXT NOT NULL,
    "status" "TechnicalRequestStatus" NOT NULL DEFAULT 'NOUVEAU',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "organization" TEXT,
    "actor_type" "ActorType" NOT NULL DEFAULT 'PRODUCTEUR',
    "locality" TEXT,
    "region" TEXT,
    "crop" TEXT NOT NULL,
    "crop_stage" TEXT,
    "symptoms" TEXT NOT NULL,
    "description" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_to_id" TEXT,

    CONSTRAINT "technical_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_request_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT NOT NULL,

    CONSTRAINT "technical_request_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_request_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "technical_request_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT[],
    "target_audience" TEXT NOT NULL,
    "duration" TEXT,
    "modality" "TrainingModality" NOT NULL DEFAULT 'PRESENTIEL',
    "location" TEXT,
    "date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "price" TEXT,
    "max_participants" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_registrations" (
    "id" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'INSCRIT',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "organization" TEXT,
    "actor_type" "ActorType" NOT NULL DEFAULT 'PRODUCTEUR',
    "locality" TEXT,
    "region" TEXT,
    "motivation" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "training_id" TEXT NOT NULL,

    CONSTRAINT "training_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "training_id" TEXT NOT NULL,

    CONSTRAINT "training_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnership_requests" (
    "id" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'NOUVEAU',
    "partner_type" "PartnerType" NOT NULL,
    "organization_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "locality" TEXT,
    "region" TEXT,
    "proposal" TEXT NOT NULL,
    "objectives" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_to_id" TEXT,

    CONSTRAINT "partnership_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnership_request_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "partnership_request_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "image_url" TEXT,
    "link_url" TEXT,
    "link_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_role" TEXT,
    "author_location" TEXT,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "rating" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cta_clicks" (
    "id" TEXT NOT NULL,
    "cta_type" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "product_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cta_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_is_published_is_featured_sort_order_idx" ON "products"("is_published", "is_featured", "sort_order");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "crops_name_key" ON "crops"("name");

-- CreateIndex
CREATE UNIQUE INDEX "crops_slug_key" ON "crops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pests_name_key" ON "pests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pests_slug_key" ON "pests"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "commercial_requests_status_idx" ON "commercial_requests"("status");

-- CreateIndex
CREATE INDEX "commercial_requests_type_created_at_idx" ON "commercial_requests"("type", "created_at");

-- CreateIndex
CREATE INDEX "commercial_requests_created_at_idx" ON "commercial_requests"("created_at");

-- CreateIndex
CREATE INDEX "commercial_request_notes_request_id_idx" ON "commercial_request_notes"("request_id");

-- CreateIndex
CREATE INDEX "technical_requests_status_idx" ON "technical_requests"("status");

-- CreateIndex
CREATE INDEX "technical_requests_created_at_idx" ON "technical_requests"("created_at");

-- CreateIndex
CREATE INDEX "technical_request_photos_request_id_idx" ON "technical_request_photos"("request_id");

-- CreateIndex
CREATE INDEX "technical_request_notes_request_id_idx" ON "technical_request_notes"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainings_slug_key" ON "trainings"("slug");

-- CreateIndex
CREATE INDEX "trainings_is_published_date_idx" ON "trainings"("is_published", "date");

-- CreateIndex
CREATE INDEX "training_registrations_training_id_status_idx" ON "training_registrations"("training_id", "status");

-- CreateIndex
CREATE INDEX "training_registrations_created_at_idx" ON "training_registrations"("created_at");

-- CreateIndex
CREATE INDEX "partnership_requests_status_idx" ON "partnership_requests"("status");

-- CreateIndex
CREATE INDEX "partnership_requests_created_at_idx" ON "partnership_requests"("created_at");

-- CreateIndex
CREATE INDEX "partnership_request_notes_request_id_idx" ON "partnership_request_notes"("request_id");

-- CreateIndex
CREATE INDEX "contact_requests_is_read_created_at_idx" ON "contact_requests"("is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_key_key" ON "content_blocks"("key");

-- CreateIndex
CREATE INDEX "faqs_is_active_sort_order_idx" ON "faqs"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "testimonials_is_active_sort_order_idx" ON "testimonials"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "cta_clicks_cta_type_idx" ON "cta_clicks"("cta_type");

-- CreateIndex
CREATE INDEX "cta_clicks_page_idx" ON "cta_clicks"("page");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_on_products" ADD CONSTRAINT "crop_on_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_on_products" ADD CONSTRAINT "crop_on_products_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pest_on_products" ADD CONSTRAINT "pest_on_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pest_on_products" ADD CONSTRAINT "pest_on_products_pest_id_fkey" FOREIGN KEY ("pest_id") REFERENCES "pests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_on_products" ADD CONSTRAINT "tag_on_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_on_products" ADD CONSTRAINT "tag_on_products_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_requests" ADD CONSTRAINT "commercial_requests_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_request_notes" ADD CONSTRAINT "commercial_request_notes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "commercial_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_request_notes" ADD CONSTRAINT "commercial_request_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_requests" ADD CONSTRAINT "technical_requests_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_request_photos" ADD CONSTRAINT "technical_request_photos_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "technical_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_request_notes" ADD CONSTRAINT "technical_request_notes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "technical_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_request_notes" ADD CONSTRAINT "technical_request_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_registrations" ADD CONSTRAINT "training_registrations_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_documents" ADD CONSTRAINT "training_documents_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_requests" ADD CONSTRAINT "partnership_requests_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_request_notes" ADD CONSTRAINT "partnership_request_notes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "partnership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_request_notes" ADD CONSTRAINT "partnership_request_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


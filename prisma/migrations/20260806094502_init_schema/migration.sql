-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'DONOR', 'PENDING_ORGANIZER', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "public"."OrganizationVerificationStatus" AS ENUM ('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DocumentVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."OrganizationType" AS ENUM ('NGO', 'TRUST', 'SOCIETY', 'FOUNDATION', 'EDUCATIONAL', 'HOSPITAL', 'CORPORATE', 'GOVERNMENT', 'RELIGIOUS', 'INDIVIDUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CampaignCategory" AS ENUM ('EDUCATION', 'HEALTHCARE', 'ENVIRONMENT', 'ANIMAL_WELFARE', 'DISASTER_RELIEF', 'FOOD', 'SPORTS', 'COMMUNITY', 'CHILD_WELFARE', 'ELDERLY_SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('REGISTRATION_CERTIFICATE', 'PAN_CARD', 'GST_CERTIFICATE', 'TAX_EXEMPTION_CERTIFICATE', 'GOVERNMENT_REGISTRATION', 'BANK_STATEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentGateway" AS ENUM ('MOCK', 'RAZORPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'DONOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."OrganizationType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT NOT NULL,
    "website" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postal_code" TEXT NOT NULL,
    "registration_no" TEXT NOT NULL,
    "pan_number" TEXT NOT NULL,
    "gst_number" TEXT,
    "tax_exemption_no" TEXT,
    "account_holder" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "verification_status" "public"."OrganizationVerificationStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "admin_notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_documents" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "document_type" "public"."DocumentType" NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "verification_status" "public"."DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "reviewer_notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" UUID NOT NULL,
    "organizer_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "public"."CampaignCategory" NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "story" TEXT,
    "beneficiary_name" TEXT,
    "beneficiary_story" TEXT,
    "location" TEXT,
    "cover_image_url" TEXT,
    "goal_amount" DECIMAL(12,2) NOT NULL,
    "current_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "admin_notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."donations" (
    "id" UUID NOT NULL,
    "donor_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "status" "public"."DonationStatus" NOT NULL DEFAULT 'PENDING',
    "donated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "donation_id" UUID NOT NULL,
    "gateway" "public"."PaymentGateway" NOT NULL DEFAULT 'MOCK',
    "gateway_order_id" TEXT,
    "gateway_payment_id" TEXT,
    "gateway_signature" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "amount" DECIMAL(12,2) NOT NULL,
    "fee" DECIMAL(12,2) DEFAULT 0,
    "tax" DECIMAL(12,2) DEFAULT 0,
    "net_amount" DECIMAL(12,2),
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "failure_reason" TEXT,
    "gateway_response" JSONB,
    "processed_at" TIMESTAMP(3),
    "refunded_amount" DECIMAL(12,2) DEFAULT 0,
    "refund_reason" TEXT,
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_role_idx" ON "public"."profiles"("role");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "public"."profiles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_profile_id_key" ON "public"."organizations"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "public"."organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_registration_no_key" ON "public"."organizations"("registration_no");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_pan_number_key" ON "public"."organizations"("pan_number");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_gst_number_key" ON "public"."organizations"("gst_number");

-- CreateIndex
CREATE INDEX "organizations_profile_id_idx" ON "public"."organizations"("profile_id");

-- CreateIndex
CREATE INDEX "organizations_verification_status_idx" ON "public"."organizations"("verification_status");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "public"."organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_created_at_idx" ON "public"."organizations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "organization_documents_storage_path_key" ON "public"."organization_documents"("storage_path");

-- CreateIndex
CREATE INDEX "organization_documents_organization_id_idx" ON "public"."organization_documents"("organization_id");

-- CreateIndex
CREATE INDEX "organization_documents_document_type_idx" ON "public"."organization_documents"("document_type");

-- CreateIndex
CREATE INDEX "organization_documents_verification_status_idx" ON "public"."organization_documents"("verification_status");

-- CreateIndex
CREATE INDEX "organization_documents_uploaded_at_idx" ON "public"."organization_documents"("uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "public"."campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaigns_organizer_id_idx" ON "public"."campaigns"("organizer_id");

-- CreateIndex
CREATE INDEX "campaigns_organization_id_idx" ON "public"."campaigns"("organization_id");

-- CreateIndex
CREATE INDEX "campaigns_category_idx" ON "public"."campaigns"("category");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "public"."campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_featured_idx" ON "public"."campaigns"("featured");

-- CreateIndex
CREATE INDEX "campaigns_created_at_idx" ON "public"."campaigns"("created_at");

-- CreateIndex
CREATE INDEX "donations_donor_id_idx" ON "public"."donations"("donor_id");

-- CreateIndex
CREATE INDEX "donations_campaign_id_idx" ON "public"."donations"("campaign_id");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "public"."donations"("status");

-- CreateIndex
CREATE INDEX "donations_created_at_idx" ON "public"."donations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_donation_id_key" ON "public"."payments"("donation_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_order_id_key" ON "public"."payments"("gateway_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_payment_id_key" ON "public"."payments"("gateway_payment_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_gateway_idx" ON "public"."payments"("gateway");

-- CreateIndex
CREATE INDEX "payments_processed_at_idx" ON "public"."payments"("processed_at");

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_documents" ADD CONSTRAINT "organization_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."donations" ADD CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."donations" ADD CONSTRAINT "donations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

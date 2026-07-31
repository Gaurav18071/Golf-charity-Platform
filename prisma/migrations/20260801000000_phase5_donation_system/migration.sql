-- Phase 5: Donation System
-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CharityCategory" AS ENUM ('EDUCATION', 'HEALTHCARE', 'ENVIRONMENT', 'COMMUNITY', 'SPORTS', 'ANIMALS', 'DISASTER_RELIEF', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "category" "CharityCategory" NOT NULL,
    "imageUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizerName" TEXT NOT NULL,
    "organizerBio" TEXT,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "userId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "donorName" TEXT,
    "charityId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "message" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "providerSignature" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "failureReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseUserId_key" ON "users"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "charities_slug_key" ON "charities"("slug");

-- CreateIndex
CREATE INDEX "donations_supabaseUserId_charityId_createdAt_idx" ON "donations"("supabaseUserId", "charityId", "createdAt");

-- CreateIndex
CREATE INDEX "donations_charityId_idx" ON "donations"("charityId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_donationId_key" ON "payments"("donationId");

-- CreateIndex
CREATE INDEX "payments_donationId_idx" ON "payments"("donationId");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "charities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

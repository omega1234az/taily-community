-- CreateEnum
CREATE TYPE "public"."LostPetStatus" AS ENUM ('lost', 'found', 'pending', 'closed', 'reunited', 'reported', 'fake', 'expired');

-- CreateTable
CREATE TABLE "public"."PetSpecies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "role" TEXT DEFAULT 'user',
    "houseNumber" TEXT,
    "street" TEXT,
    "village" TEXT,
    "subDistrict" TEXT,
    "district" TEXT,
    "province" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."LostPet" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "missingLocation" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "lostDate" TIMESTAMP(3) NOT NULL,
    "reward" DOUBLE PRECISION,
    "status" "public"."LostPetStatus" NOT NULL DEFAULT 'lost',
    "userId" TEXT NOT NULL,
    "petId" INTEGER NOT NULL,
    "facebook" TEXT,
    "ownerName" TEXT,
    "phone" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostPet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PetChronicDisease" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "disease" TEXT NOT NULL,
    "description" TEXT,
    "diagnosedAt" TIMESTAMP(3),

    CONSTRAINT "PetChronicDisease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VaccineRecord" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "vaccine" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nextDue" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "VaccineRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "breed" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "color" JSONB,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "markings" TEXT,
    "isNeutered" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PetImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "petId" INTEGER NOT NULL,
    "mainImage" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PetImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LostPetImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "lostPetId" INTEGER NOT NULL,

    CONSTRAINT "LostPetImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Clue" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "location" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "witnessName" TEXT,
    "contactDetails" TEXT,
    "userId" TEXT,
    "lostPetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClueImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "clueId" INTEGER NOT NULL,

    CONSTRAINT "ClueImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoundPet" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "foundDate" TIMESTAMP(3) NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "breed" TEXT,
    "gender" TEXT,
    "color" JSONB,
    "age" INTEGER,
    "distinctive" TEXT,
    "status" TEXT NOT NULL DEFAULT 'finding',
    "userId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT,
    "facebook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoundPet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" SERIAL NOT NULL,
    "reporterId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FoundPetImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "foundPetId" INTEGER NOT NULL,

    CONSTRAINT "FoundPetImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "linkUrl" TEXT,
    "referenceId" INTEGER,
    "referenceType" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PetSpecies_name_key" ON "public"."PetSpecies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "public"."Account"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "public"."PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LostPet" ADD CONSTRAINT "LostPet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LostPet" ADD CONSTRAINT "LostPet_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PetChronicDisease" ADD CONSTRAINT "PetChronicDisease_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VaccineRecord" ADD CONSTRAINT "VaccineRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pet" ADD CONSTRAINT "Pet_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "public"."PetSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PetImage" ADD CONSTRAINT "PetImage_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LostPetImage" ADD CONSTRAINT "LostPetImage_lostPetId_fkey" FOREIGN KEY ("lostPetId") REFERENCES "public"."LostPet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Clue" ADD CONSTRAINT "Clue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Clue" ADD CONSTRAINT "Clue_lostPetId_fkey" FOREIGN KEY ("lostPetId") REFERENCES "public"."LostPet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClueImage" ADD CONSTRAINT "ClueImage_clueId_fkey" FOREIGN KEY ("clueId") REFERENCES "public"."Clue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoundPet" ADD CONSTRAINT "FoundPet_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "public"."PetSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoundPet" ADD CONSTRAINT "FoundPet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FoundPetImage" ADD CONSTRAINT "FoundPetImage_foundPetId_fkey" FOREIGN KEY ("foundPetId") REFERENCES "public"."FoundPet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

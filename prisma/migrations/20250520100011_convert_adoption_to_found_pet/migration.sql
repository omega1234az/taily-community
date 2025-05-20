/*
  Warnings:

  - You are about to drop the `adoptionimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `adoptionpost` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isNeutered` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `adoptionimage` DROP FOREIGN KEY `AdoptionImage_adoptionId_fkey`;

-- DropForeignKey
ALTER TABLE `adoptionpost` DROP FOREIGN KEY `AdoptionPost_userId_fkey`;

-- AlterTable
ALTER TABLE `pet` ADD COLUMN `isNeutered` INTEGER NOT NULL,
    ADD COLUMN `markings` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `adoptionimage`;

-- DropTable
DROP TABLE `adoptionpost`;

-- CreateTable
CREATE TABLE `FoundPet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `foundDate` DATETIME(3) NOT NULL,
    `species` VARCHAR(191) NOT NULL,
    `breed` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `distinctive` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'finding',
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoundPetImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `foundPetId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FoundPet` ADD CONSTRAINT `FoundPet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoundPetImage` ADD CONSTRAINT `FoundPetImage_foundPetId_fkey` FOREIGN KEY (`foundPetId`) REFERENCES `FoundPet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

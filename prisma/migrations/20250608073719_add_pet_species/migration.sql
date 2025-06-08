/*
  Warnings:

  - You are about to drop the column `species` on the `foundpet` table. All the data in the column will be lost.
  - You are about to drop the column `petType` on the `lostpet` table. All the data in the column will be lost.
  - You are about to drop the column `species` on the `pet` table. All the data in the column will be lost.
  - Added the required column `speciesId` to the `FoundPet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speciesId` to the `LostPet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speciesId` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `foundpet` DROP COLUMN `species`,
    ADD COLUMN `speciesId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `lostpet` DROP COLUMN `petType`,
    ADD COLUMN `speciesId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pet` DROP COLUMN `species`,
    ADD COLUMN `speciesId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `PetSpecies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PetSpecies_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_speciesId_fkey` FOREIGN KEY (`speciesId`) REFERENCES `PetSpecies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LostPet` ADD CONSTRAINT `LostPet_speciesId_fkey` FOREIGN KEY (`speciesId`) REFERENCES `PetSpecies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoundPet` ADD CONSTRAINT `FoundPet_speciesId_fkey` FOREIGN KEY (`speciesId`) REFERENCES `PetSpecies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

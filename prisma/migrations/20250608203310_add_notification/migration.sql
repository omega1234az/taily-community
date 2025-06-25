/*
  Warnings:

  - You are about to drop the column `speciesId` on the `lostpet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `lostpet` DROP FOREIGN KEY `LostPet_speciesId_fkey`;

-- DropIndex
DROP INDEX `LostPet_speciesId_fkey` ON `lostpet`;

-- AlterTable
ALTER TABLE `lostpet` DROP COLUMN `speciesId`;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `linkUrl` VARCHAR(191) NULL,
    `referenceId` INTEGER NULL,
    `referenceType` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `lostpet` ADD COLUMN `facebook` VARCHAR(191) NULL,
    ADD COLUMN `ownerName` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `petimage` ADD COLUMN `mainImage` BOOLEAN NOT NULL DEFAULT false;

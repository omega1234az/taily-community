/*
  Warnings:

  - You are about to drop the `medicalrecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `medicalrecord` DROP FOREIGN KEY `MedicalRecord_petId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `district` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `houseNumber` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `province` VARCHAR(191) NULL,
    ADD COLUMN `street` VARCHAR(191) NULL,
    ADD COLUMN `subDistrict` VARCHAR(191) NULL,
    ADD COLUMN `village` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `medicalrecord`;

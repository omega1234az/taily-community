/*
  Warnings:

  - You are about to alter the column `color` on the `pet` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - Added the required column `petId` to the `LostPet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lostpet` ADD COLUMN `petId` INTEGER NOT NULL,
    ADD COLUMN `status` ENUM('lost', 'found', 'pending', 'closed', 'reunited', 'reported', 'fake') NOT NULL DEFAULT 'lost';

-- AlterTable
ALTER TABLE `pet` MODIFY `color` JSON NULL;

-- AddForeignKey
ALTER TABLE `LostPet` ADD CONSTRAINT `LostPet_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

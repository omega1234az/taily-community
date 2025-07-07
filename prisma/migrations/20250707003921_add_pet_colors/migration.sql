/*
  Warnings:

  - You are about to alter the column `color` on the `foundpet` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `foundpet` MODIFY `color` JSON NULL;

/*
  Warnings:

  - Made the column `color` on table `pet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `pet` MODIFY `color` VARCHAR(191) NOT NULL;

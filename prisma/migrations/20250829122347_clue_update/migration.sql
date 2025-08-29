-- DropForeignKey
ALTER TABLE `clue` DROP FOREIGN KEY `Clue_userId_fkey`;

-- DropIndex
DROP INDEX `Clue_userId_fkey` ON `clue`;

-- AlterTable
ALTER TABLE `clue` ADD COLUMN `contactDetails` VARCHAR(191) NULL,
    ADD COLUMN `witnessName` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Clue` ADD CONSTRAINT `Clue_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

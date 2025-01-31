/*
  Warnings:

  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fieldsize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `numbersOfField` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ranges` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `UserSettings` ADD COLUMN `accountActivated` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Milestone`;

-- DropTable
DROP TABLE `fieldsize`;

-- DropTable
DROP TABLE `numbersOfField`;

-- DropTable
DROP TABLE `ranges`;

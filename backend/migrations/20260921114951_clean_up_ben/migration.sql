/*
  Warnings:

  - You are about to drop the `GameMove` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameMove" DROP CONSTRAINT "GameMove_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameMove" DROP CONSTRAINT "GameMove_playerId_fkey";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "roundTimeout" SET DEFAULT 5;

-- DropTable
DROP TABLE "GameMove";

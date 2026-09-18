-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_winnerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "elo" INTEGER NOT NULL DEFAULT 100;

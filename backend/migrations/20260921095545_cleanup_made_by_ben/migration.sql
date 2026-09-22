/*
  Warnings:

  - You are about to drop the `Tournament` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TournamentParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Tournament" DROP CONSTRAINT "Tournament_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_userId_fkey";

-- DropTable
DROP TABLE "Tournament";

-- DropTable
DROP TABLE "TournamentParticipant";

-- DropEnum
DROP TYPE "ParticipantStatus";

-- DropEnum
DROP TYPE "TournamentStatus";

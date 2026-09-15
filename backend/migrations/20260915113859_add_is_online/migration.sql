/*
  Warnings:

  - The `status` column on the `Friendship` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `points` on the `TournamentParticipant` table. All the data in the column will be lost.
  - The `status` column on the `TournamentParticipant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[tournamentId,userId]` on the table `TournamentParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `round` to the `GameMove` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `move` on the `GameMove` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('ROCK', 'PAPER', 'SCISSORS');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PENDING', 'STARTED', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('REGISTERED', 'PLAYING', 'ELIMINATED', 'WINNER');

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_player1Id_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_player2Id_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "GameMove" DROP CONSTRAINT "GameMove_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameMove" DROP CONSTRAINT "GameMove_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_userId_fkey";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "status",
ADD COLUMN     "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "maxScore" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "roundTimeout" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "scorePlayer1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scorePlayer2" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "GameMove" ADD COLUMN     "round" INTEGER NOT NULL,
DROP COLUMN "move",
ADD COLUMN     "move" "MoveType" NOT NULL;

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "status",
ADD COLUMN     "status" "TournamentStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "maxPlayers" SET DEFAULT 4;

-- AlterTable
ALTER TABLE "TournamentParticipant" DROP COLUMN "points",
ALTER COLUMN "bracketPosition" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ParticipantStatus" NOT NULL DEFAULT 'REGISTERED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oauthId" TEXT,
ADD COLUMN     "oauthProvider" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "avatarUrl" SET DEFAULT 'https://i.imgur.com/pOm90d7.jpeg';

-- CreateIndex
CREATE UNIQUE INDEX "TournamentParticipant_tournamentId_userId_key" ON "TournamentParticipant"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMove" ADD CONSTRAINT "GameMove_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMove" ADD CONSTRAINT "GameMove_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

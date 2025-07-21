/*
  Warnings:

  - A unique constraint covering the columns `[quizId,userId]` on the table `QuizParticipant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spaceId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spaceId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "spaceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuizParticipant_quizId_userId_key" ON "QuizParticipant"("quizId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_spaceId_key" ON "Room"("spaceId");

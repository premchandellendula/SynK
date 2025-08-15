/*
  Warnings:

  - Added the required column `questionStartedAt` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "questionStartedAt" TIMESTAMP(3) NOT NULL;

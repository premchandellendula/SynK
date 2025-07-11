-- DropForeignKey
ALTER TABLE "QuizParticipant" DROP CONSTRAINT "QuizParticipant_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizParticipant" DROP CONSTRAINT "QuizParticipant_userId_fkey";

-- AddForeignKey
ALTER TABLE "QuizParticipant" ADD CONSTRAINT "QuizParticipant_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizParticipant" ADD CONSTRAINT "QuizParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { prisma, QuestionStatus } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function changeQuestionStatusHandler(io: Server, socket: Socket){
    socket.on("change-question-status", async (data) => {        
        const { roomId, questionId, status, userId } = data;
        // might get an issue for userId
        if (!userId) {
            socket.emit("question-status-error", { message: "Invalid user ID." });
            return;
        }

        try {
            const question = await prisma.question.findUnique({
                where: {
                    id: questionId
                },
                select: {
                    roomId: true
                }
            })

            if(!question){
                throw new Error("Question not found")
            }

            const room = await prisma.room.findUnique({
                where: {
                    id: question.roomId
                },
                select: {
                    creatorId: true
                }
            })

            if(!room){
                throw new Error("Room not found")
            }

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can change question status.")
            }

            await prisma.question.update({
                where: {
                    id: questionId
                },
                data: {
                    status
                }
            })

            const allQuestions = await prisma.question.findMany({
                where: {
                    roomId
                },
                include: {
                    sender: true,
                    upVotes: true
                },
                orderBy: [
                    { upVotes: { _count: "desc"}},
                    { createdAt: "asc"}
                ]
            })

            const questions = allQuestions.filter(q => q.status === QuestionStatus.PENDING);
            const archiveQuestions = allQuestions.filter(q => q.status === QuestionStatus.ANSWERED);
            const ignoredQuestions = allQuestions.filter(q => q.status === QuestionStatus.IGNORED);

            io.to(roomId).emit("question-status-changed", {
                questions,
                archiveQuestions,
                ignoredQuestions
            })

        }catch(err) {
            console.error("Error handling change-question-status:", err);
            socket.emit("question-status-error", { message: "Could not update status. Try again." });
        }
    })
}
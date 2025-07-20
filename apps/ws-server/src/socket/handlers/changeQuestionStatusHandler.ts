import { prisma } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function changeQuestionStatusHandler(io: Server, socket: Socket){
    socket.on("change-question-status", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }
        
        const { roomId, questionId, status, userId } = data;
        // might get an issue for userId

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

            if(room.creatorId != userId){
                throw new Error("Only the room owner can change question status.")
            }

            const updatedQuestion = await prisma.question.update({
                where: {
                    id: questionId
                },
                data: {
                    status
                }
            })

            io.to(roomId).emit("question-status-changed", {
                questionId,
                updatedQuestion
            })

        }catch(err) {
            console.error("Error handling vote-question:", err);
            socket.emit("question-status-error", { message: "Could not update status. Try again." });
        }
    })
}
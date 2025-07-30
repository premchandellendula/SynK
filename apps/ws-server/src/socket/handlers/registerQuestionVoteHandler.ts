import { prisma } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function registerQuestionVoteHandler(io: Server, socket: Socket){
    socket.on("vote-question", async (data) => {
        // console.log(data);
        const { questionId, userId, roomId } = data;

        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })

            if(!room){
                throw new Error("Room not found")
            }

            const existingUpVote = await prisma.upVote.findUnique({
                where: {
                    userId_questionId: {
                        userId,
                        questionId
                    }
                }
            })

            if(existingUpVote){
                await prisma.upVote.delete({
                    where: {
                        id: existingUpVote.id
                    }
                });
            }else{
                await prisma.upVote.create({
                    data: {
                        userId,
                        questionId
                    }
                });
            }

            // const voteInfo = await prisma.question.findUnique({
            //     where: {
            //         id: questionId,
            //         roomId
            //     },
            //     select: {
            //         upVotes: true
            //     }
            // })

            // const updatedUpVotes = voteInfo?.upVotes ?? [];
            const updatedQuestions = await prisma.question.findMany({
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
            io.to(roomId).emit("vote-question-updated", {
                questions: updatedQuestions
            });
        }catch(err){
            console.error("Error handling vote-question:", err);
            socket.emit("vote-error", { message: "Could not update vote. Try again." });
        }
    })
}
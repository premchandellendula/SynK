import { prisma } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function registerQuestionVoteHandler(io: Server, socket: Socket){
    socket.on("vote-question", async (data) => {
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error("Invalid JSON string received:", data);
                    return;
                }
            }
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
    
                const upVoteCount = await prisma.upVote.count({
                    where: { questionId }
                });
    
                io.to(roomId).emit("vote-question-updated", {
                    questionId,
                    upVoteCount
                });
            }catch(err){
                console.error("Error handling vote-question:", err);
                socket.emit("vote-error", { message: "Could not update vote. Try again." });
            }
        })
}
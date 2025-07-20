import { prisma } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function registerPollVoteHandler(io: Server, socket: Socket){
    socket.on("vote-poll", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }
        // console.log(data);
        const { pollId, userId, roomId, optionId } = data;

        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })

            if(!room){
                throw new Error("Room not found")
            }

            if (room.endDate < new Date() || room.status === "ENDED") {
                    throw new Error("Room has expired.")
            }

            const existingPoll = await prisma.poll.findUnique({
                where: {
                    id: pollId,
                    roomId
                }
            })

            if(!existingPoll){
                throw new Error("Poll not found")
            }

            if (existingPoll.status === "ENDED" || existingPoll.isLaunched === false) {
                throw new Error("Poll is not active. Voting is not allowed.")
            }

            const option = await prisma.pollOption.findFirst({
                where: {
                    id: optionId,
                    pollId: pollId
                }
            });

            if (!option) {
                throw new Error("Option not found in the specified poll.")
            }

            if (userId) {
                const existingVote = await prisma.pollVote.findFirst({
                    where: {
                        pollId,
                        userId: userId
                    }
                });

                if (existingVote) {
                    throw new Error("User has already voted in this poll.")
                }
            }

            await prisma.$transaction([
                prisma.pollVote.create({
                    data: {
                        optionId,
                        userId: userId ?? null,
                        pollId
                    }
                }),
                prisma.pollOption.update({
                    where: { id: optionId },
                    data: {
                        voteCount: { increment: 1 }
                    }
                })
            ]);

            const pollVotes = await prisma.pollVote.findMany({
                where: {
                    pollId
                }
            })
            const optionVotes = await prisma.pollOption.findMany({
                where: {
                    pollId
                }
            })

            io.to(roomId).emit("poll-vote-added", {
                pollId,
                pollVotes,
                optionVotes
            })
        }catch(err) {
            console.log("Error voting the poll: ", err);
            socket.emit("poll-vote-error", { message: "Could not add vote. Try again." });
        }
    })
}
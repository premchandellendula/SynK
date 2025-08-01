import { PollStatus, prisma } from "@repo/db";
import { Server, Socket } from "socket.io";

type PollOption = {
    text: string
}

export default function pollHandler(io: Server, socket: Socket){
    socket.on("launch-new-poll", async (data) => {
        const {pollQuestion, options, roomId, userId} = data;

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

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can create or launch polls.")
            }

            const poll = await prisma.poll.create({
                data: {
                    pollQuestion,
                    creatorId: userId,
                    roomId,
                    isLaunched: true,
                    status: "LAUNCHED",
                    options: {
                        create: options.map((opt: PollOption) => ({
                            text: opt.text,
                            voteCount: 0
                        }))
                    }
                },
                include: {
                    options: true
                }
            })
            // console.log(poll);
            io.to(roomId).emit("new-poll-launched", {
                poll
            })
            // console.log("Emitted to room:", roomId);
        } catch(err) {
            console.error("Error launching a new poll:", err);
            socket.emit("launching-new-poll-error", { message: "Could not launch a new poll. Try again." });
        }
    })

    socket.on("launch-existing-poll", async (data) => {
        console.log(data);
        const {pollId, roomId, userId} = data;

        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })
            if(!room){throw new Error("Room not found")}

            if (room.endDate < new Date() || room.status === "ENDED") {
                    throw new Error("Room has expired.")
            }

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can create or launch polls.")
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

            await prisma.$transaction([
                prisma.pollVote.deleteMany({
                    where: { pollId }
                }),
                
                prisma.pollOption.updateMany({
                    where: { pollId },
                    data: { voteCount: 0 }
                })
            ])

            const poll = await prisma.poll.update({
                where: {
                    id: pollId,
                    roomId
                },
                data: {
                    isLaunched: true,
                    status: "LAUNCHED"
                },
                include: {
                    options: true
                }
            })

            // console.log(poll)

            io.to(roomId).emit("existing-poll-launched", {
                poll
            })
        }catch(err) {
            console.error("Error launching a existing poll:", err);
            socket.emit("launching-existing-poll-error", { message: "Could not launch an existing poll. Try again." });
        }
    })

    socket.on("end-poll", async (data) => {
        const {pollId, roomId, userId} = data;

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

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can create or launch polls.")
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

            const poll = await prisma.poll.update({
                where: {
                    id: pollId,
                    roomId
                },
                data: {
                    isLaunched: false,
                    status: PollStatus.DRAFT
                }
            })

            io.to(roomId).emit("poll-ended", {
                poll
            })
        } catch(err) {
            console.error("Error ending a  poll:", err);
            socket.emit("ending-poll-error", { message: "Could not end a poll. Try again." });
        }
    })

    socket.on("remove-poll", async (data) => {
        const {pollId, roomId, userId} = data;

        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId }
            })

            if(!room){throw new Error("Room not found")}

            if (room.endDate < new Date() || room.status === "ENDED") {
                    throw new Error("Room has expired.")
            }

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can create or launch polls.")
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
            const poll = await prisma.poll.delete({
                where: {
                    id: pollId,
                    roomId
                },
                select: {
                    id: true
                }
            })

            io.to(roomId).emit("poll-removed", {
                poll
            })
        } catch(err) {
            console.error("Error deleting a  poll:", err);
            socket.emit("deleting-poll-error", { message: "Could not delete a poll. Try again." });
        }
    })
}
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../../lib/authMiddleware";
import { PollStatus, prisma } from "@repo/db";

export async function PUT(req: NextRequest, { params }: { params : Promise<{roomId: string, pollId: string}>}){
    const { roomId, pollId } = await params;

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })
        if(!room){
            return NextResponse.json({
                message: "Room not found"
            }, {status: 404})
        }

        if(room.creatorId !== auth.userId){
            return NextResponse.json({
                message: "Only the room owner can create or launch polls."
            }, {status: 403})
        }

        const existingPoll = await prisma.poll.findUnique({
            where: {
                id: pollId,
                roomId
            }
        })

        if(!existingPoll){
            return NextResponse.json({
                message: "Poll not found"
            }, {status: 404})
        }

        await prisma.pollVote.deleteMany({
            where: { pollId }
        });

        await prisma.pollOption.updateMany({
            where: { pollId },
            data: { voteCount: 0 }
        });

        const poll = await prisma.poll.update({
            where: {
                id: pollId,
                roomId
            },
            data: {
                isLaunched: true,
                status: PollStatus.LAUNCHED
            },
            select: {
                id: true,
                pollQuestion: true,
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true,
                updatedAt: true,
                status: true,
                isLaunched: true,
                options: {
                    select: {
                        text: true,
                        voteCount: true,
                        pollVotes: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Poll re-launched successfully",
            poll
        }, {status: 200})
    }catch(err) {
        console.log("Error re-launching poll: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../lib/authMiddleware";
import { PollStatus, prisma } from "@repo/db";

// end pole
export async function PUT(req: NextRequest, { params } : { params: Promise<{roomId: string, pollId: string}>}){
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

        if (room.endDate < new Date() || room.status === "ENDED") {
            return NextResponse.json({
                message: "Room has expired."
            }, { status: 400 });
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

        const poll = await prisma.poll.update({
            where: {
                id: pollId,
                roomId
            },
            data: {
                isLaunched: false,
                status: PollStatus.ENDED
            }
        })

        return NextResponse.json({
            message: "Poll ended successfully",
            poll
        }, {status: 200})
    }catch(err) {
        console.log("Error ending the poll: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// get individual poll
export async function GET(req: NextRequest, { params }: { params: Promise<{roomId: string, pollId: string}>}){
    const { roomId, pollId } = await params;
    
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

        if (room.endDate < new Date() || room.status === "ENDED") {
            return NextResponse.json({
                message: "Room has expired."
            }, { status: 400 });
        }

        const poll = await prisma.poll.findUnique({
            where: {
                id: pollId,
                roomId
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
                        id: true,
                        text: true,
                        voteCount: true,
                        pollVotes: {
                            select: {
                                user: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if(!poll){
            return NextResponse.json({
                message: "Poll not found"
            }, {status: 404})
        }

        return NextResponse.json({
            message: "Poll fetched successfully",
            poll
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the poll: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500})
    }
}

// delete the poll
export async function DELETE(req: NextRequest, { params }: { params: Promise<{roomId: string, pollId: string}>}){
    const { roomId, pollId } = await params;

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;
    
    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })

        if (!room || room.creatorId !== auth.userId) {
            return NextResponse.json({ 
                message: "Unauthorized" 
            }, { status: 403 })
        }
        const existingPoll = await prisma.poll.findUnique({
            where: {
                id: pollId,
                roomId
            }
        })

        if(!existingPoll){
            return NextResponse.json({
                message: "Poll not found",
            }, {status: 404})
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

        return NextResponse.json({
            message: "Poll deleted successfully",
            poll
        })
    }catch(err) {
        console.log("Error deleting the poll: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500})
    }
}
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{roomId: string}>}){
    const { roomId } = await params;
    
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
        const poll = await prisma.poll.findFirst({
            where: {
                roomId,
                status: "LAUNCHED",
                isLaunched: true
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
                        pollVotes: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Active Poll fetched successfully",
            poll
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the active poll: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500})
    }
}
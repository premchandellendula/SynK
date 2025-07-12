import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../lib/authMiddleware";
import { prisma } from "@repo/db";

const pollBody = zod.object({
    pollQuestion: zod.string().min(1, "Poll question is required"),
    options: zod.array(
        zod.object({
            text: zod.string().min(1, "Option text is required")
        })
    ).min(2).max(4)
})

export async function POST(req: NextRequest, { params }: { params : Promise<{roomId: string}>}){
    const { roomId } = await params;
    const body = await req.json();
    const response = pollBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    const { pollQuestion, options } = response.data

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
            })
        }

        const poll = await prisma.poll.create({
            data: {
                pollQuestion,
                creatorId: auth.userId,
                roomId,
                isLaunched: true,
                status: "LAUNCHED",
                options: {
                    create: options.map(opt => ({
                        text: opt.text,
                        voteCount: 0
                    }))
                }
            },
            include: {
                options: true
            }
        })

        return NextResponse.json({
            message: "Poll created successfully",
            poll
        }, {status: 201})
    }catch(err) {
        console.log("Error creating a poll: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}

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
        const polls = await prisma.poll.findMany({
            where: {
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
                        pollVotes: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Polls fetched successfully",
            polls
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the polls: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500})
    }
}
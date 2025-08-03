import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
    const { roomId, quizId } = await params;
    
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
        const quizQuestion = await prisma.quizQuestion.findFirst({
            where: {
                quizId,
                isActive: true
            },
            include: {
                quizOptions: {
                    include: {
                        quizVotes: true
                    }
                },
                quizVotes: true
            }
        })

        return NextResponse.json({
            message: "Active Question fetched successfully",
            quizQuestion
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the active quiz question: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500})
    }
}
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
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
        
        if (room.endDate < new Date()) {
            return NextResponse.json({
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }

        const quiz = await prisma.quiz.update({
            where: {
                id: quizId,
                roomId
            },
            data: {
                status: "STOPPED"
            }
        })

        if(!quiz){
            return NextResponse.json({
                message: "Quiz not found"
            }, {status: 404})
        }

        return NextResponse.json({
            message: "Ended the quiz successfully",
            quiz
        }, {status: 200})
    }catch(err) {
        console.log("Error ending the quiz: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
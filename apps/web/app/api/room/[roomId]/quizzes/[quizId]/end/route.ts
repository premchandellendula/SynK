import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../../lib/authMiddleware";

export async function PUT(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
    const { roomId, quizId } = await params;
    const auth = await authMiddleware(req)
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
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }

        if(room.creatorId !== auth.userId){
            return NextResponse.json({
                message: "Only room owners can end the quiz"
            }, {status: 403})
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
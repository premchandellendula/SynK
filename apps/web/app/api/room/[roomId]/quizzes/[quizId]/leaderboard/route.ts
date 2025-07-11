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
        
        if (room.endDate < new Date()) {
            return NextResponse.json({
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            }
        })

        if(!quiz){
            return NextResponse.json({
                message: "Quiz not found"
            }, {status: 404})
        }

        const leaderboard = await prisma.quizLeaderBoard.findMany({
            where: {
                quizId: quizId
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                score: true
            },
            orderBy: {
                score: 'desc'
            }
        })

        return NextResponse.json({
            message: "Fetched the user results successfully",
            leaderboard
        }, {status: 200})
    }catch(err) {
        console.log("Error ending the quiz: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// code - OBCI8BW2M
// roomId - 4e78cd44-6672-460a-ad24-74d8e83d335b
// quizId - fc21f598-5ab7-43c5-b3a4-07f5f6078a10
// quizQuestion - 9e0fc069-5f77-4749-a9cb-0e36cd57c9f6
// quizOption - 428f624b-0bcb-4bde-a2c1-31d9d8a916d1
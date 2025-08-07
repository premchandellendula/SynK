import { authMiddleware } from "@/app/api/lib/authMiddleware";
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
    const { roomId, quizId } = await params;

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    if (!auth.userId) {
        return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

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

        const topThree = await prisma.quizLeaderBoard.findMany({
            where: {quizId},
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
            },
            take: 3
        })

        const fullLeaderboard = await prisma.quizLeaderBoard.findMany({
            where: { quizId },
            select: {
                userId: true,
                score: true,
            },
            orderBy: {
                score: "desc",
            },
        })

        const userIndex = fullLeaderboard.findIndex(entry => entry.userId === auth.userId)
        let userRankInfo = null;

        if(userIndex !== -1){
            const userScore = fullLeaderboard[userIndex]?.score

            const userDetails = await prisma.user.findUnique({
                where: { id: auth.userId },
                select: { id: true, name: true}
            })

            userRankInfo = {
                rank: userIndex + 1,
                userId: auth.userId,
                name: userDetails?.name || "Unknown",
                score: userScore,
            };
        }

        return NextResponse.json({
            message: "Fetched the user results successfully",
            topThree: topThree.map((entry, idx) => ({
                rank: idx + 1,
                userId: entry.user.id,
                name: entry.user.name,
                score: entry.score,
            })),
            user: userRankInfo,
        }, {status: 200})
    }catch(err) {
        console.log("Error ending the quiz: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
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
        const quiz = await prisma.quiz.findFirst({
            where: {
                roomId,
                status: "LAUNCHED",
            },
            include: {
                currentQuestion: {
                    include: {
                        quizOptions: {
                            include: {
                                quizVotes: true
                            }
                        },
                        quizVotes: true
                    }
                },
                quizQuestions: {
                    include: {
                        quizOptions: {
                            include: {
                                quizVotes: true
                            }
                        },
                        quizVotes: true
                    }
                },
                quizParticipant: true
            }
        })

        return NextResponse.json({
            message: "Active Quiz fetched successfully",
            quiz
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the active quiz: ", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500})
    }
}
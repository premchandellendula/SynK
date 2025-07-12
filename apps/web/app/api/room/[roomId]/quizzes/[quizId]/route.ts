import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../lib/authMiddleware";

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
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                roomId,
                id: quizId
            },
            select: {
                id: true,
                quizName: true,
                roomId: true,
                creatorId: true,
                createdAt: true,
                updatedAt: true,
                quizQuestions: {
                    select: {
                        id: true,
                        question: true,
                        voteCount: true,
                        quizOptions: {
                            select: {
                                id: true,
                                text: true,
                                voteCount: true,
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Quiz fetched successfully",
            quiz
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the quizzes: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
    const { roomId, quizId } = await params;
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
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }

        const existingQuiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            }
        })

        if(!existingQuiz){
            return NextResponse.json({
                message: "Quiz not found"
            }, {status: 404})
        }

        if(existingQuiz.creatorId !== auth.userId){
            return NextResponse.json({
                message: "Only room owners can delete the quiz"
            }, {status: 403})
        }

        const quiz = await prisma.quiz.delete({
            where: {
                id: quizId,
                roomId
            }
        })

        return NextResponse.json({
            message: "Quiz deleted successfully",
            quiz
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the quizzes: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
    const { roomId, quizId } = await params;
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
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }

        const existingQuiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            }
        })

        if(!existingQuiz){
            return NextResponse.json({
                message: "Quiz not found"
            }, {status: 404})
        }

        if(existingQuiz.creatorId !== auth.userId){
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

        return NextResponse.json({
            message: "Quiz ended successfully",
            quiz
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the quizzes: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
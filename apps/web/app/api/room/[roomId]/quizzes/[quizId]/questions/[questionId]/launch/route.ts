import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../../../../lib/authMiddleware";

export async function PUT(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string, questionId: string}>}){
    const { roomId, quizId, questionId } = await params;
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
                message: "Only room owners can launch the question in a quiz"
            }, {status: 403})
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

        if (quiz.status !== "LAUNCHED") {
            return NextResponse.json({
                message: "Quiz is not running. Cannot activate questions."
            }, { status: 400 });
        }
        const question = await prisma.quizQuestion.findUnique({
            where: { id: questionId }
        });

        if (!question || question.quizId !== quizId) {
            return NextResponse.json({
                message: "Question does not belong to this quiz."
            }, { status: 400 });
        }
        await prisma.$transaction([
            prisma.quizQuestion.updateMany({
                where: {
                    quizId,
                    isActive: true
                },
                    data: {
                    isActive: false
                }
            }),
            prisma.quiz.update({
                where: {
                    id: quizId
                },
                data: {
                    currentQuestionId: questionId
                }
            }),
            prisma.quizQuestion.update({
                where: {
                    id: questionId
                },
                data: {
                    isActive: true
                }
            })
        ]);
        
        return NextResponse.json({
            message: "Question is now active."
        }, {status: 200})
    }catch(err) {
        console.log("Error updating the question: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
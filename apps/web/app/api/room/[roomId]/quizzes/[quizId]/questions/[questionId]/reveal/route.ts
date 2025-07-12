import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../../../../../lib/authMiddleware";

export async function PUT(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string, questionId: string}>}){
    const { roomId, quizId, questionId } = await params;
    const auth = await  authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return NextResponse.json({ message: "Room not found" }, { status: 404 });
        }

        if (room.endDate < new Date() || room.status === "ENDED") {
            return NextResponse.json({ message: "Room has already ended." }, { status: 400 });
        }

        if(room.creatorId !== auth.userId){
            return NextResponse.json({
                message: "Only owners can reveal the answers"
            }, {status: 403})
        }

        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
        }

        if (quiz.status !== "LAUNCHED") {
            return NextResponse.json({ message: "Quiz is not active." }, { status: 400 });
        }

        const question = await prisma.quizQuestion.findUnique({
            where: { id: questionId },
            include: {
                quizOptions: {
                    select: {
                        id: true,
                        text: true,
                        voteCount: true,
                        isCorrect: true
                    }
                }
            }
        });

        if (!question || question.quizId !== quizId) {
            return NextResponse.json({ message: "Invalid question." }, { status: 400 });
        }

        await prisma.quizQuestion.update({
            where: { id: questionId },
            data: { isAnswerRevealed: true }
        });

        return NextResponse.json({
            message: "Answer revealed successfully",
            question: {
                id: question.id,
                question: question.question,
                options: question.quizOptions
            }
        }, { status: 200 });
    }catch(err) {
        console.log("Error updating the question to reveal answer: ",err)
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
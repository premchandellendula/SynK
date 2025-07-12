import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../../../../../lib/authMiddleware";
import { prisma, QuizStatus } from "@repo/db";

const quizVoteBody = zod.object({
    quizOptionId: zod.string()
})

export async function POST(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string, questionId: string}>}){
    const { roomId, quizId, questionId } = await params;
    const body = await req.json()
    const response = quizVoteBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    const { quizOptionId } = response.data;

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
                id: quizId
            }
        })

        if(!quiz){
            return NextResponse.json({
                message: "Quiz not found"
            }, {status: 404})
        }

        if (quiz.status !== QuizStatus.LAUNCHED) {
            return NextResponse.json({
                message: "Quiz is not currently running."
            }, { status: 400 });
        }

        const question = await prisma.quizQuestion.findUnique({
            where: {
                id: questionId,
                quizId
            }
        });

        if (!question || !question.isActive) {
            return NextResponse.json({
                message: "Question is not active. Cannot vote."
            }, { status: 400 });
        }

        const existingVote = await prisma.quizVote.findUnique({
            where: {
                userId_quizQuestionId: {
                    userId: auth.userId,
                    quizQuestionId: questionId
                }
            }
        });

        if (existingVote) {
            return NextResponse.json({
                message: "You have already voted for this question."
            }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            const option = await tx.quizOption.findUnique({
                where: { id: quizOptionId},
                select: {
                    isCorrect: true,
                    quizQuestionId: true,
                    quizQuestion: {
                        select: {
                            quizId: true
                        }
                    }
                }
            })

            if (!option) throw new Error("Invalid quiz option");

            const quizId = option.quizQuestion.quizId;

            await tx.quizVote.create({
                data: {
                    quizOptionId,
                    userId: auth.userId,
                    quizQuestionId: questionId
                }
            });

            if (option.isCorrect) {
                await tx.quizLeaderBoard.upsert({
                    where: {
                        quizId_userId: {
                            userId: auth.userId,
                            quizId: quizId
                        }
                    },
                    create: {
                        userId: auth.userId,
                        quizId: quizId,
                        score: 1
                    },
                    update: {
                        score: { increment: 1 }
                    }
                });
            }
        })

        return NextResponse.json(
            { message: "Vote recorded successfully." },
            { status: 200 }
        );
    }catch(err) {
        console.log("Error voting the question: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
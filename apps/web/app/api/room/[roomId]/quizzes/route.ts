import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../lib/authMiddleware";
import zod from 'zod';
import { prisma } from "@repo/db";

const quizPostBody = zod.object({
    quizName: zod.string(),
    quizQuestions: zod.array(
        zod.object({
            quizQuestion: zod.string(),
            quizOptions: zod.array(
                zod.object({
                    text: zod.string(),
                    isCorrect: zod.boolean()
                })
            ).min(2).max(4)
        })
    )
})

export async function POST(req: NextRequest, { params }: { params: Promise<{roomId: string}>}){
    const { roomId } = await params;
    const body = await req.json();
    const response = quizPostBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }
    
    const { quizName, quizQuestions } = response.data;

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

        if(room.creatorId !== auth.userId){
            return NextResponse.json({
                message: "Only room owner has the access to create quiz."
            }, {status: 403})
        }

        const quiz = await prisma.quiz.create({
            data: {
                quizName,
                roomId,
                creatorId: auth.userId,
                status: "LAUNCHED",
                quizQuestions: {
                    create: quizQuestions.map((q) => ({
                        question: q.quizQuestion,
                        voteCount: 0,
                        quizOptions: {
                            create: q.quizOptions.map((opt) => ({
                                text: opt.text,
                                isCorrect: opt.isCorrect,
                                voteCount: 0,
                            }))
                        },
                        timerSeconds: 30
                    }))
                }
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
                        quizOptions: true,
                        quizVotes: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Quiz created and launched successfully.",
            quiz
        }, { status: 201 });
    }catch(err) {
        console.log("Error creating a quiz: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

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
                message: "Room has already ended. Cannot create quiz."
            }, { status: 400 });
        }
        const quizzes = await prisma.quiz.findMany({
            where: {
                roomId
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
                }
            }
        })

        return NextResponse.json({
            message: "Quizzes fetched successfully",
            quizzes
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the quizzes: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
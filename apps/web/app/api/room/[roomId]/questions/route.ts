import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../lib/authMiddleware";
import { prisma, QuestionStatus } from "@repo/db";

const questionBody = zod.object({
    question: zod.string()
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }){
    const { roomId } = await params;

    const body = await req.json();
    const response = questionBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }

    const { question } = response.data;

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try{
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
        const ques = await prisma.question.create({
            data: {
                question,
                roomId,
                senderId: auth.userId
            },
            select: {
                id: true,
                question: true,
                senderId: true,
                roomId: true,
                upVotes: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Message Created successfully",
            question: ques
        }, {status: 201})
    }catch(err){
        console.error("Error creating a message:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }){
    const { roomId } = await params;

    try{
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
        const allQuestions = await prisma.question.findMany({
            where: {
                roomId
            },
            select: {
                id: true,
                question: true,
                createdAt: true,
                roomId: true,
                upVotes: true,
                status: true,
                sender: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { upVotes: { _count: "desc" } },
                { createdAt: "asc" },
            ],
        })

        const questions = allQuestions.filter(q => q.status === QuestionStatus.PENDING);
        const archiveQuestions = allQuestions.filter(q => q.status === QuestionStatus.ANSWERED);
        const ignoredQuestions = allQuestions.filter(q => q.status === QuestionStatus.IGNORED);

        return NextResponse.json({
            message: "Questions fetched successfully",
            questions,
            archiveQuestions,
            ignoredQuestions
        }, {status: 200})
    }catch(err){
        console.log("Error fetching the question: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
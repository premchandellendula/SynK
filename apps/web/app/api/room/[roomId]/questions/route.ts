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

    const searchParams = req.nextUrl.searchParams;
    const allowedStatuses: QuestionStatus[] = [
        "PENDING",
        "ANSWERED",
        "IGNORED"
    ];
    const rawStatus = searchParams.get("status");
    const status: QuestionStatus = allowedStatuses.includes(rawStatus as QuestionStatus) ? (rawStatus as QuestionStatus) : "PENDING";

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
        const questions = await prisma.question.findMany({
            where: {
                roomId,
                status
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

        return NextResponse.json({
            message: "Questions fetched successfully",
            questions
        }, {status: 200})
    }catch(err){
        console.log("Error fetching the question: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
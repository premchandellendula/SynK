import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../lib/authMiddleware";
import { prisma } from "@repo/db";

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
        const ques = await prisma.question.create({
            data: {
                question,
                roomId,
                senderId: auth.userId
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
            }
        })

        return NextResponse.json({
            message: "Message Created successfully",
            question: ques
        })
    }catch(err){
        console.error("Error creating a message:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }){
    const { roomId } = await params;

    try{
        const questions = await prisma.question.findMany({
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
            }
        })

        return NextResponse.json({
            message: "Questions fetched successfully",
            questions
        })
    }catch(err){
        console.log("Error fetching the question: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
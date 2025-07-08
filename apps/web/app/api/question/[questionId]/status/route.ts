import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../lib/authMiddleware";
import { prisma } from "@repo/db";

const statusPutBody = zod.object({
    status: zod.enum(["PENDING", "ANSWERED", "IGNORED"])
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{questionId: string}>}){
    const { questionId } = await params;

    const body = await req.json();
    const response = statusPutBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, { status: 400 })
    }
    const { status } = response.data;

    const auth = await authMiddleware(req)
    if(!("authorized" in auth)) return auth;

    try {
        const question = await prisma.question.findUnique({
            where: {
                id: questionId
            },
            select: {
                roomId: true
            }
        })

        if(!question){
            return NextResponse.json({
                message: "Question not found"
            }, {status: 404})
        }

        const room = await prisma.room.findUnique({
            where: {
                id: question.roomId
            },
            select: {
                creatorId: true
            }
        })

        if(!room){
            return NextResponse.json({
                message: "Room not found"
            }, {status: 404})
        }

        if(room.creatorId != auth.userId){
            return NextResponse.json({
                message: "Only the room owner can change question status."
            }, { status: 403 });
        }

        const updatedQuestion = await prisma.question.update({
            where: {
                id: questionId
            },
            data: {
                status
            }
        })

        return NextResponse.json({
            message: "Question status updated.",
            question: updatedQuestion
        });
    }catch(err) {
        console.log("Error changing the status of a question: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
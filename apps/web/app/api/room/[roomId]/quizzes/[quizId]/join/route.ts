import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../../../lib/authMiddleware";
import { prisma } from "@repo/db";

const quizJoinBody = zod.object({
    name: zod.string()
})

export async function POST(req: NextRequest, { params }: { params: Promise<{roomId: string, quizId: string}>}){
    const { roomId, quizId } = await params;
    const body = await req.json()
    const response = quizJoinBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }

    const auth = await authMiddleware(req)
    if(!("authorized" in auth)) return auth;

    const { name } = response.data;

    try {
        const quizUser = await prisma.quizParticipant.create({
            data: {
                name,
                quizId,
                userId: auth.userId
            }
        })

        return NextResponse.json({
            message: "User added to the quiz",
            user: {
                id: quizUser.id,
                name: quizUser.name
            }
        })
    }catch(err) {
        console.log("Error joining the room: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
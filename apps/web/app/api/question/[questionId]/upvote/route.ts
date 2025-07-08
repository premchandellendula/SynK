import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../lib/authMiddleware";
import { prisma } from "@repo/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }){
    const { questionId } = await params;

    const auth = await authMiddleware(req);
    if (!("authorized" in auth)) return auth;

    try {
        const existingUpVote = await prisma.upVote.findUnique({
            where: {
                userId_questionId: {
                    userId: auth.userId,
                    questionId
                }
            }
        })

        if(existingUpVote){
            await prisma.upVote.delete({
                where: {
                    id: existingUpVote.id
                }
            })

            const count = await prisma.upVote.count({
                where: {
                    questionId
                }
            })

            return NextResponse.json({
                message: "Upvote removed.",
                upVoteCount: count
            });
        }else{
            await prisma.upVote.create({
                data: {
                    userId: auth.userId,
                    questionId
                }
            })

            const count = await prisma.upVote.count({
                where: {
                    questionId
                }
            })

            return NextResponse.json({
                message: "Question upVoted",
                upVoteCount: count
            })
        }
    }catch(err) {
        console.log("Error upvoting the question: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
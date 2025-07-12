import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../../../../lib/authMiddleware";

const pollVoteBody = zod.object({
    optionId: zod.string()
})

export async function POST(req: NextRequest, { params }: { params: Promise<{roomId: string, pollId: string}>}){
    const { roomId, pollId } = await params;
    const body = await req.json()

    const response = pollVoteBody.safeParse(body);
    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }
    
    const { optionId } = response.data;

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
                message: "Room has expired."
            }, { status: 400 });
        }

        const existingPoll = await prisma.poll.findUnique({
            where: {
                id: pollId,
                roomId
            }
        })

        if(!existingPoll){
            return NextResponse.json({
                message: "Poll not found"
            }, {status: 404})
        }

        if (existingPoll.status === "ENDED" || existingPoll.isLaunched === false) {
            return NextResponse.json(
                { message: "Poll is not active. Voting is not allowed." },
                { status: 400 }
            );
        }

        const option = await prisma.pollOption.findFirst({
            where: {
                id: optionId,
                pollId: pollId
            }
        });

        if (!option) {
            return NextResponse.json({
                message: "Option not found in the specified poll."
            }, { status: 404 });
        }

        if (auth.userId) {
            const existingVote = await prisma.pollVote.findFirst({
                where: {
                    pollId,
                    userId: auth.userId
                }
            });

            if (existingVote) {
                return NextResponse.json(
                    { message: "User has already voted in this poll." },
                    { status: 400 }
                );
            }
        }

        await prisma.$transaction([
            prisma.pollVote.create({
                data: {
                    optionId,
                    userId: auth.userId ?? null,
                    pollId
                }
            }),
            prisma.pollOption.update({
                where: { id: optionId },
                data: {
                    voteCount: { increment: 1 }
                }
            })
        ]);

        return NextResponse.json(
            { message: "Vote recorded successfully." },
            { status: 200 }
        );
    }catch(err) {
        console.log("Error voting the poll: ", err);
        return NextResponse.json({ message: "Internal server error" }, {status: 500})
    }
}
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../../lib/authMiddleware";
import { prisma } from "@repo/db";

export async function GET(req: NextRequest, { params } : { params: Promise<{spaceId: string}>}){
    const { spaceId } = await params;

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try {
        const room = await prisma.room.findUnique({
            where: {
                spaceId
            },
            select: {
                id: true,
                name: true,
                code: true,
                spaceId: true,
                startDate: true,
                endDate: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                polls: {
                    select: {
                        id: true,
                        pollQuestion: true,
                        options: true,
                        pollVotes: true
                    }
                },
                questions: {
                    select: {
                        id: true,
                        question: true,
                        upVotes: true,
                        sender: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                quizzes: {
                    select: {
                        id: true,
                        quizName: true,
                        quizQuestions: true,    
                    }
                }
            }
        })

        if(!room){
            return NextResponse.json({
                message: "Room not found"
            }, {status: 404})
        }

        return NextResponse.json({
            message: "fetched room successfully",
            room
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the room: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
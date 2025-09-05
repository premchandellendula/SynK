import { prisma } from "@repo/db";
import { customAlphabet } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../lib/authMiddleware";

const roomBody = zod.object({
    name: zod.string()
})

export async function POST(req: NextRequest){
    const body = await req.json()

    const reponse = roomBody.safeParse(body);

    if(!reponse.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }

    const { name } = reponse.data
    const code = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 9);
    const spaceId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 22);

    const auth = await authMiddleware(req)
    if(!("authorized" in auth)) return auth;
    try{
        const room = await prisma.$transaction(async (tx) => {
            const createdRoom = await tx.room.create({
                data: {
                    name,
                    code: code(),
                    spaceId: spaceId(),
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    creatorId: auth.userId,
                    users: {
                        connect: {
                            id: auth.userId
                        }
                    }
                }
            })

            return createdRoom;
        })

        const roomData = await prisma.room.findUnique({
            where: {
                id: room.id
            },
            select: {
                id: true,
                name: true,
                code: true,
                spaceId: true,
                startDate: true,
                endDate: true,
                status: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json({
            message: "Room created successfully",
            roomData
        })
    }catch(err){
        console.log("Error creating room: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest){
    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try {
        const rooms = await prisma.user.findMany({
            where: { id: auth.userId },
            select: {
                id: true,
                name: true,
                rooms: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        spaceId: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                        users: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        })

        if(!rooms){
            return NextResponse.json({
                message: "Rooms not found"
            }, {status: 404})
        }

        return NextResponse.json({
            message: "fetched rooms successfully",
            rooms
        }, {status: 200})
    }catch(err) {
        console.log("Error fetching the rooms: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
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
    const nanoidDigits = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 9);

    const auth = await authMiddleware(req)
    if(!("authorized" in auth)) return auth;
    try{
        const room = await prisma.room.create({
            data: {
                name,
                code: nanoidDigits(),
                startDate: new Date(),
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                creatorId: auth.userId
            }
        })

        const roomData = await prisma.room.findUnique({
            where: {
                id: room.id
            },
            select: {
                id: true,
                name: true,
                code: true,
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
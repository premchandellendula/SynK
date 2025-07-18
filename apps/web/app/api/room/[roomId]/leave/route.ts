import { authMiddleware } from "@/app/api/lib/authMiddleware";
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

// Leave a room or remove from room
export async function PUT(req: NextRequest, { params } : { params: Promise<{roomId: string}>}){
    const { roomId } = await params;
    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try{
        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })
        // console.log(room)
        if(!room){
            return NextResponse.json({
                message: "code is invalid or room doesn't exist"
            }, {status: 400})
        }

        if (room.endDate < new Date() || room.status === "ENDED") {
            return NextResponse.json({
                message: "Room has expired."
            }, { status: 400 });
        }

        await prisma.room.update({
            where: { id: room.id },
            data: {
                users: {
                    disconnect: { id: auth.userId}
                }
            }
        })

        return NextResponse.json({
            message: "Successfully left the room",
            roomDate: {
                roomId: room.id,
                name: room.name
            }
        })
    }catch(err){
        console.log("Error joining the room: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
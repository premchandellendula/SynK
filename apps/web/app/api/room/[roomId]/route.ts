import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../lib/authMiddleware";
import { prisma } from "@repo/db";

export async function DELETE(req: NextRequest, { params } : { params: Promise<{roomId: string}>}){
    const { roomId } = await params;

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

        if(room.creatorId !== auth.userId){
            return NextResponse.json({
                message: "You are not authorized to delete this room."
            }, { status: 403 });
        }

        const deletedRoom = await prisma.room.delete({
            where: {
                id: roomId
            }
        }) 

        return NextResponse.json({
            message: "Room deleted successfully",
            deletedRoom
        })
    }catch(err) {
        console.log("Error deleting the room: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params } : { params: Promise<{roomId: string}>}){
    const { roomId } = await params;

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

        if(room.creatorId !== auth.userId){
            return NextResponse.json({
                message: "You are not authorized to end this room."
            }, { status: 403 });
        }

        const endRoom = await prisma.room.update({
            where: {
                id: roomId
            },
            data: {
                status: "ENDED"
            }
        }) 

        return NextResponse.json({
            message: "Room ended successfully",
            endRoom
        })
    }catch(err) {
        console.log("Error deleting the room: ", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
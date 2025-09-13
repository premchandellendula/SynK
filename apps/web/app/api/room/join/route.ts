import { NextRequest, NextResponse } from "next/server";
import zod from 'zod';
import { authMiddleware } from "../../lib/authMiddleware";
import { prisma, RoomMemberStatus } from "@repo/db";

const joinRoomBody = zod.object({
    code: zod.string()
})

export async function POST(req: NextRequest){
    const body = await req.json()

    const response = joinRoomBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }
    
    const { code } = response.data;

    const auth = await authMiddleware(req);
    if(!("authorized" in auth)) return auth;

    try{
        const room = await prisma.room.findUnique({
            where: { code }
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

        const existingMember = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId: room.id,
                    userId: auth.userId
                }
            }
        });

        if (existingMember) {
            if (existingMember.status === RoomMemberStatus.JOINED) {
                return NextResponse.json({
                    message: "You have already joined this room."
                }, { status: 400 });
            } else {
                // If user was previously left, update status to joined
                await prisma.roomMember.update({
                    where: {
                        roomId_userId: {
                            roomId: room.id,
                            userId: auth.userId
                        }
                    },
                    data: {
                        status: RoomMemberStatus.JOINED
                    }
                });

                return NextResponse.json({
                    message: "Re-joined the room successfully",
                    roomData: {
                        id: room.id,
                        name: room.name,
                        code: room.code,
                        spaceId: room.spaceId
                    }
                });
            }
        }

        await prisma.$transaction([
  prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: auth.userId,
      status: RoomMemberStatus.JOINED
    }
  }),
  prisma.room.update({
    where: { id: room.id },
    data: {
      users: {
        connect: { id: auth.userId }
      }
    }
  })
]);

        return NextResponse.json({
            message: "Successfully joined the room",
            roomData: {
                id: room.id,
                name: room.name,
                code: room.code,
                spaceId: room.spaceId
            }
        });
    }catch(err){
        console.log("Error joining the room: ", err);
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
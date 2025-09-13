import { prisma, RoomMemberStatus } from "@repo/db";

export async function removeUserFromRoomDB(userId: string, roomId: string) {
    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { users: { select: { id: true } } },
        });

        if (!room) {
            console.warn(`Room ${roomId} not found`);
            return;
        }

        if (room.endDate < new Date() || room.status === "ENDED") {
            console.warn(`Room ${roomId} has expired`);
            return;
        }

        const updated = await prisma.roomMember.update({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            },
            data: {
                status: RoomMemberStatus.LEFT
            }
        });

        console.log(`Set status 'left' for user ${userId} in room ${roomId}`);
    } catch (error) {
        console.error(`Error removing user from DB:`, error);
    }
}
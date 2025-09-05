import { prisma } from "@repo/db";

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

        const isInRoom = room.users.some(user => user.id === userId);
        if (!isInRoom) {
            console.log(`User ${userId} already removed from room ${roomId}`);
            return;
        }
        await prisma.room.update({
            where: { id: roomId },
            data: {
                users: {
                    disconnect: { id: userId}
                }
            }
        })
        console.log(`Removed user ${userId} from room ${roomId} in DB`);
    } catch (error) {
        console.error(`Error removing user from DB:`, error);
    }
}
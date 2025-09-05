import cron from 'node-cron'
import { prisma } from '@repo/db'

export function startRoomStatusCron(){
    cron.schedule('*/5 * * * *', async () => {
        const now = new Date()

        try{
            const result = await prisma.room.updateMany({
                where: {
                    endDate: { lt: now },
                    status: { not: 'ENDED' }
                },
                data: { status: 'ENDED' }
            });

            console.log(`[CRON] Updated ${result.count} rooms to ENDED`);
        } catch (err) {
            console.error('[CRON] Failed to update rooms:', err);
        }
    })
}
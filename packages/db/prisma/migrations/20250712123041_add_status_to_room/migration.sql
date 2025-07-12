-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('LAUNCHED', 'ENDED', 'DELETED');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'LAUNCHED';

import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../../lib/authMiddleware";
import { prisma } from "@repo/db";

export async function GET(req: NextRequest){
    const auth = await authMiddleware(req);

    if ("authorized" in auth === false) {
        return auth; // Already a NextResponse from authMiddleware
    }

    try{
        const user = await prisma.user.findUnique({
            where: {
                id: auth.userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            message: "User fetched successfully",
            user
        })
    }catch(err){
        console.error("Error fetching user:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
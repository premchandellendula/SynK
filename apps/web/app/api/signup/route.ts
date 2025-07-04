import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db"

export async function POST(req: NextRequest){
    const { name, email, password } = await req.json();
    console.log(name)
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password
        }
    })

    return NextResponse.json({
        message: "User reated successfully",
        user
    })
}

export function GET(req: NextRequest){
    return NextResponse.json({
        message: "Working"
    })
}
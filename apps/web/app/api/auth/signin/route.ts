import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import zod from 'zod';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8)
})

export async function POST(req: NextRequest){
    const body = await req.json()
    
    const response = signinBody.safeParse(body);

    if(!response.success){
        return NextResponse.json({
            message: "Incorrect inputs"
        }, {status: 400})
    }

    const { email, password } = response.data;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            throw new Error("User not found or password missing")
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password as string)

        if(!isPasswordValid){
            NextResponse.json({
                message: "Incorrect password"
            }, {status: 400})
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET not defined")
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "2d"})

        const response = NextResponse.json({
            message: "Signin successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }, {
            status: 201
        })

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",  // change it to none when deploying
            secure: false,   // change it to true when deploying
            maxAge: 2 * 24 * 60 * 60
        })

        return response
    }catch(err) {
        console.error("Signin error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
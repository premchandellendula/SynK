import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';

export async function authMiddleware(req: NextRequest){
    const token = req.cookies.get("token")?.value;

    if(!token){
        return NextResponse.json({message: "Token is missing"}, {status: 401})
    }

    try{
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET not set");

        const decoded = jwt.verify(token, secret) as JwtPayload;

        return {
            authorized: true,
            userId: decoded.userId,
        };
    }catch(err){
        return NextResponse.json({ message: "Unauthorized", error: err instanceof Error ? err.message : "Unknown error" }, { status: 401 });
    }
}
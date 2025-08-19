import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getToken } from "next-auth/jwt";

export async function authMiddleware(req: NextRequest){
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // console.log("Token in middleware:", token);

    if (token?.id) {
        return {
            authorized: true,
            userId: token.id,
            source: "next-auth",
        };
    }

    const customToken = req.cookies.get("token")?.value;
    // console.log("customToken: ", customToken)
    if(customToken){
        try{
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error("JWT_SECRET not set");
    
            const decoded = jwt.verify(customToken, secret) as JwtPayload;
    
            return {
                authorized: true,
                userId: decoded.userId,
                source: "custom",
            };
        }catch(err){
            return NextResponse.json({ message: "Unauthorized", error: err instanceof Error ? err.message : "Unknown error" }, { status: 401 });
        }
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
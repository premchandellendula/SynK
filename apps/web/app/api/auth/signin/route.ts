import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import zod from 'zod';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8)
})

// export async function POST(req: NextRequest){
//     const body = await req.json()
    
//     const response = signinBody.safeParse(body);

//     if(!response.success){
//         return NextResponse.json({
//             message: "Incorrect inputs"
//         }, {status: 400})
//     }

//     const { email, password } = response.data;

//     try {
//         const user = await prisma.user.findUnique({
//             where: {
//                 email
//             }
//         })

//         if(!user){
//             return NextResponse.json({
//                 message: "Invalid email or password"
//             }, { status: 400 });
//         }

//         const isPasswordValid = await bcrypt.compare(password, user.password as string)

//         if(!isPasswordValid){
//             return NextResponse.json({
//                 message: "Invalid email or password"
//             }, { status: 400 });
//         }

//         const JWT_SECRET = process.env.JWT_SECRET;
//         if(!JWT_SECRET){
//             throw new Error("JWT_SECRET not defined")
//         }

//         const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "2d"})

//         const response = NextResponse.json({
//             message: "Signin successful",
//             data: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email
//             }
//         }, {
//             status: 201
//         })

//         response.cookies.set("token", token, {
//             httpOnly: true,
//             sameSite: "lax",  // change it to none when deploying
//             secure: true,   // change it to true when deploying
//             maxAge: 2 * 24 * 60 * 60
//         })

//         return response
//     }catch(err) {
//         console.error("Signin error:", err);
//         return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//     }
// }

export async function POST(req: NextRequest){
    console.log("STEP 1: Request received");

    const body = await req.json();
    console.log("STEP 2: Body parsed", body);

    const response = signinBody.safeParse(body);
    if (!response.success) {
        console.log("STEP 3: Validation failed");
        return NextResponse.json({ message: "Incorrect inputs" }, { status: 400 });
    }

    const { email, password } = response.data;

    try {
        console.log("STEP 4: Finding user in DB");
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log("STEP 5: User not found");
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        console.log("STEP 6: Comparing passwords");
        const isPasswordValid = await bcrypt.compare(password, user.password as string);

        if (!isPasswordValid) {
            console.log("STEP 7: Password mismatch");
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        console.log("STEP 8: Creating JWT token");
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.log("STEP 9: JWT_SECRET missing");
            throw new Error("JWT_SECRET not defined");
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "2d" });
        console.log("STEP 10: JWT created");

        const response = NextResponse.json({
            message: "Signin successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }, { status: 201 });

        console.log("STEP 11: Setting cookie");
        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 2 * 24 * 60 * 60
        });

        console.log("STEP 12: Response ready");
        return response;
    } catch (err) {
        console.error("STEP ERROR: Caught in catch block", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

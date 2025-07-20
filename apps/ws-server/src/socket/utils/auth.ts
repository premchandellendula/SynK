import jwt, { JwtPayload } from 'jsonwebtoken';

export function authUser(token: string):string | null {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET not defined")
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (typeof decoded === "string" || !decoded.userId) {
            console.error("Decoded token is a string, expected object, or no userId found");
            return null;
        }
        
        return decoded.userId;
    } catch (err) {
        console.error("JWT verification failed:", err);
        return null;
    }
}
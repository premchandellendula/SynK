import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@repo/db';

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt"
    },
    debug: false,
    callbacks: {
        async signIn({user, account, profile}){
            console.log("SIGN IN", { user, account, profile })
            return true
        },
        async session({ session, token }){
            if (token?.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // console.log("JWT CALLBACK - setting token.id to:", user.id);
                token.id = user.id;
            }
            return token;
        },
    }
})

export { handler as GET, handler as POST}
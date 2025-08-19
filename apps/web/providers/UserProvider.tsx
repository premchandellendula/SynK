"use client"
import { User } from "@/types/types";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

type UserContextType = {
    user: User | null
    login: () => Promise<void>
    logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps { 
    children: React.ReactNode
}

export const UserProvider = ({children}: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter()

    const login = async () => {
        try{
            const res = await axios.get(`/api/auth/me`, {
                withCredentials: true
            });

            setUser(res.data.user)
        }catch(err){
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setUser(null);
                } else {
                    console.error("Failed to fetch user", err);
                }
            } else {
                console.error("Failed to fetch user", err);
            }
        }
    }

    const logout = async () => {
        if(status === "authenticated"){
            await signOut({ callbackUrl: "/"})
            setUser(null)
        }else{
            try {
                await axios.post(`/api/auth/logout`, {}, {
                    withCredentials: true
                })
                setUser(null)
                router.push('/')
            } catch (err) {
                console.error("Failed to logout", err)
            }
        }   
    }

    useEffect(() => {
        if(status === "authenticated" && session.user){
            setUser({
                id: session.user.id,
                name: session.user.name ?? "",
                email: session.user.email ?? ""
            })
        }else if(status === "unauthenticated"){
            login()
        }
    }, [session, status])

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    )
}
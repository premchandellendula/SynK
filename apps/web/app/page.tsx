import { prisma } from "@repo/db";
import { Button } from "@repo/ui/button";

export default async function Home() {
    const userData = await prisma.user.findFirst()
    return (
        <div className="text-2xl">
            {userData?.name ?? "No user added yet"}
            <div className="max-w-7xl bg-red-600 h-screen text-3xl">
                hello hii
            </div>
            <Button children="Hello" appName="SynK" />
        </div>
    )
}

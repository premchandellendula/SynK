import { prisma } from "@repo/db";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";

export default async function Home() {
    const userData = await prisma.user.findFirst()
    return (
        <div className="text-2xl">
            {userData?.name ?? "No user added yet"}
            <div className="max-w-7xl text-3xl">
                hello hii
            </div>
            
            <Button children="hello" appName="SynK" />
            <div>hello</div>
        </div>
    )
}

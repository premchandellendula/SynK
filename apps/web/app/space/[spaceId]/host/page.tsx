"use client"
import AdminPollsBox from "@/components/admin/AdminPollsBox";
import AdminQuestionBox from "@/components/admin/AdminQuestionBox";
import AdminQuizBox from "@/components/admin/AdminQuizBox";
import InteractionBox from "@/components/admin/InteractionBox";
import HostNavbar from "@/components/navbar/HostNavbar";
import { Interaction, Room } from "@/types/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Host(){
    const { spaceId } = useParams();
    const [roomDetails, setRoomDetails] = useState<Room | null>(null)
    const [interaction, setInteraction] = useState<Interaction>("qna")
    // console.log(spaceId)
    useEffect(() => {
        async function fetchRoomDetails(){
            const response = await axios.get(`/api/room/space/${spaceId}`, {
                withCredentials: true
            })

            setRoomDetails(response.data.room)
            // console.log(response.data)
        } 

        fetchRoomDetails()
    }, [])

    if (!roomDetails) return null;

    return (
        <div className="w-screen h-screen overflow-hidden">
            <HostNavbar name={roomDetails?.name} startDate={roomDetails?.startDate} endDate={roomDetails?.endDate} code={roomDetails?.code} />
            <div className="h-full pt-15 flex divide-x divide-foreground/10">
                <div className="w-[30%] relative p-2">
                    <InteractionBox setInteraction={setInteraction} />
                </div>
                <div className="flex-1 relative p-2">
                    {interaction === "qna" && <AdminQuestionBox />}
                    {interaction === "poll" && <AdminPollsBox />}
                    {interaction === "quiz" && <AdminQuizBox />}
                </div>
            </div>
        </div>
    )
}
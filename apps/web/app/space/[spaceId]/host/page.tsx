"use client"
import ActivityBox from "@/components/admin/ActivityBox";
import AdminPollsBox from "@/components/admin/AdminPollsBox";
import AdminQuestionBox from "@/components/admin/AdminQuestionBox";
import AdminQuizBox from "@/components/admin/AdminQuizBox";
import QuestionCard from "@/components/cards/QuestionCard";
import QuestionOnAdminPanel from "@/components/cards/QuestionOnAdminPanel";
import QuestionInput from "@/components/live/QuestionInput";
import Tabs from "@/components/live/Tabs";
import HostNavbar from "@/components/navbar/HostNavbar";
import { Room } from "@/types/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Host(){
    const { spaceId } = useParams();
    const [roomDetails, setRoomDetails] = useState<Room | null>(null)
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
        <div className="flex flex-col h-screen overflow-hidden">
            <HostNavbar name={roomDetails?.name} startDate={roomDetails?.startDate} endDate={roomDetails?.endDate} code={roomDetails?.code} />
            <div className="w-full flex flex-1 divide-x divide-foreground/10">
                <div className="w-[30%] p-2">
                    <ActivityBox />
                </div>
                <div className="flex-1 min-h-screen p-2">
                    {/* <AdminQuestionBox /> */}
                    {/* <AdminPollsBox /> */}
                    <AdminQuizBox />
                    {/* <QuestionOnAdminPanel />
                    <QuestionOnAdminPanel />
                    <QuestionOnAdminPanel />
                    <QuestionOnAdminPanel /> */}
                </div>
            </div>
        </div>
    )
}
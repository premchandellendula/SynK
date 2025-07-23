"use client"
import AdminQuestionBox from "@/components/admin/AdminQuestionBox";
import QuestionCard from "@/components/cards/QuestionCard";
import QuestionOnAdminPanel from "@/components/cards/QuestionOnAdminPanel";
import QuestionInput from "@/components/live/QuestionInput";
import Tabs from "@/components/live/Tabs";
import UserNavbar from "@/components/navbar/UserNavbar";
import { Room } from "@/types/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Live(){
    const { spaceId } = useParams();
    const [roomDetails, setRoomDetails] = useState<Room | null>(null)
    console.log(spaceId)
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

    return (
        <div className="flex flex-col">
            <UserNavbar name={roomDetails?.name} />
            <div className="max-w-4xl w-3xl mx-auto min-h-screen p-2">
                <Tabs />
                <QuestionInput />
                <QuestionCard />
                <QuestionOnAdminPanel />
                <AdminQuestionBox />
            </div>
        </div>
    )
}
"use client"
import AdminQuestionBox from "@/components/admin/AdminQuestionBox";
import Poll from "@/components/cards/Poll";
import QuestionCard from "@/components/cards/QuestionCard";
import QuestionOnAdminPanel from "@/components/cards/QuestionOnAdminPanel";
import UserQuestionBox from "@/components/live/liveqna/UserQuestionBox";
import Tabs from "@/components/live/Tabs";
import UserNavbar from "@/components/navbar/UserNavbar";
import QuizQuestionCardUser from "@/components/quizTaker/QuizQuestionCardUser";
import UserNameInput from "@/components/quizTaker/UserNameInput";
import { Interaction, Room } from "@/types/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Live(){
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

    return (
        <div className="flex flex-col h-screen">
            <UserNavbar name={roomDetails?.name} />
            <div className="max-w-4xl w-3xl mx-auto flex-1 p-2 border-x border-input/50 pt-14">
                <Tabs setInteraction={setInteraction} />
                {interaction === "qna" && <UserQuestionBox />}
                {interaction === "poll" && <Poll />}
                {interaction === "quiz" && <QuizQuestionCardUser />}
                {/* <QuestionInput />
                <QuestionCard />
                <QuizQuestionCardUser />
                {/* <UserNameInput /> */}
            </div>
        </div>
    )
}
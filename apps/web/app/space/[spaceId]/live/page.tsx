"use client"
import UserPoll from "@/components/cards/UserPoll";
import UserQuestionBox from "@/components/live/liveqna/UserQuestionBox";
import Tabs from "@/components/live/Tabs";
import UserNavbar from "@/components/navbar/UserNavbar";
import QuizQuestionCardUser from "@/components/quizTaker/QuizQuestionCardUser";
import { useJoinRoomSocket } from "@/hooks/useJoinRoomSocket";
import useLeaveRoomOnRouteChange from "@/hooks/useLeaveRoomOnRouteChange";
import { useSocket } from "@/hooks/useSocket";
import { useUser } from "@/hooks/useUser";
import usePollStore from "@/store/pollStore";
import useQuizStore from "@/store/quizStore";
import useRoomStore from "@/store/roomStore";
import { Interaction, Room } from "@/types/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Live(){
    const { spaceId } = useParams();
    const [roomDetails, setRoomDetails] = useState<Room | null>(null)
    const [interaction, setInteraction] = useState<Interaction>("qna")
    // console.log(spaceId)
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const socket = useSocket();
    const { setActivePoll } = usePollStore();
    const { setActiveQuiz } = useQuizStore();

    useJoinRoomSocket({ socket, roomId, userId: user?.id })
    useEffect(() => {
        async function fetchRoomDetails(){
            try {
                const response = await axios.get(`/api/room/space/${spaceId}`, {
                    withCredentials: true,
                });
                setRoomDetails(response.data.room);
            } catch (err) {
                console.error("Error fetching room details:", err);
            }
        } 

        fetchRoomDetails()
    }, [spaceId])

    useEffect(() => {
        if (!roomId) return;

        const fetchActivePoll = async () => {
            try {
                const response = await axios.get(`/api/room/${roomId}/polls/active`, {
                    withCredentials: true
                });
                const poll = response.data.poll;
                if (poll) {
                    setActivePoll(poll);
                    setInteraction("poll");
                }
            } catch (err) {
                console.error("Failed to fetch active poll:", err);
            }
        };

        const timeout = setTimeout(() => {
            fetchActivePoll();
        }, 300);

        return () => clearTimeout(timeout);
    }, [roomId, setActivePoll]);

    useEffect(() => {
        if (!roomId) return;

        const fetchActiveQuiz = async () => {
            try {
                const response = await axios.get(`/api/room/${roomId}/quizzes/active`, {
                    withCredentials: true
                });
                const quiz = response.data.quiz;
                if (quiz) {
                    setActiveQuiz(quiz);
                    setInteraction("quiz");
                }
            } catch (err) {
                console.error("Failed to fetch active quiz:", err);
            }
        };

        const timeout = setTimeout(() => {
            fetchActiveQuiz();
        }, 300);

        return () => clearTimeout(timeout);
    }, [roomId, setActiveQuiz]);

    useLeaveRoomOnRouteChange();

    return (
        <div className="flex flex-col h-screen">
            <UserNavbar name={roomDetails?.name} />
            <div className="max-w-4xl w-full mx-auto flex-1 p-2 border-x border-input/50 pt-14">
                <Tabs interaction={interaction} setInteraction={setInteraction} />
                {interaction === "qna" && <UserQuestionBox setInteraction={setInteraction} />}
                {interaction === "poll" && <UserPoll setInteraction={setInteraction} />}
                {interaction === "quiz" && <QuizQuestionCardUser setInteraction={setInteraction} />}
            </div>
        </div>
    )
}
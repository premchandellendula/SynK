import { IQuizBuilderStages, QuizLeaderboard, QuizLeaderboardProps } from '@/types/types'
import React, { useEffect, useState } from 'react'
import UserScoreCard from '../leaderboard/UserScoreCard'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import useQuizStore from '@/store/quizStore'
import axios from 'axios'
import Spinner from '../loaders/Spinner'

interface IQuizLeaderboardData {
    leaderboard: QuizLeaderboard[],
    pagination: {
        page: number,
        limit: number,
        totalCount: number,
        hasNextPage: boolean
    }
}

const Leaderboard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
    const [leaderboardData, setLeaderboardData] = useState<IQuizLeaderboardData>({
        leaderboard: [],
        pagination: {
            page: 1,
            limit: 10,
            totalCount: 0,
            hasNextPage: false
        }
    })
    const activeQuiz = useQuizStore((s) => s.activeQuiz)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;
    useJoinRoomSocket({socket, roomId, userId: user?.id})
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const handleLeaderboardReveal = async (data: {quizId: string, roomId: string, userId: string}) => {
            setLoading(true);
            // console.log("data: ", data)
            try {
                const response = await axios.get(`/api/room/${data.roomId}/quizzes/${data.quizId}/leaderboard`)
                console.log(response.data)
                setLeaderboardData(response.data)
            } catch(err) {
                console.log("Error fetching the leaderboard: ", err)
            }finally{
                setLoading(false)
            }
        }

        const attachListener = () => {
            socket.on("leaderboard-revealed", handleLeaderboardReveal)
        }
        socket.on("connect", attachListener)

        return () => {
            socket.off("connect", attachListener)
            socket.off("leaderboard-revealed", handleLeaderboardReveal)
        }
    }, [socket])

    if(loading){
        return (
            <div className='flex justify-center items-center h-full'>
                <Spinner />
            </div>
        )
    }
    return (
        <div className='flex flex-col absolute top-12 bottom-2 left-0 right-0 p-2'>
            <div className="overflow-y-auto grid grid-cols-1 gap-1.5">
                {leaderboardData.leaderboard.map((entry) => <UserScoreCard key={entry.userId} rank={entry.rank} userId={entry.userId} name={entry.name} score={entry.score} total={totalQuestions} />)}
            </div>
        </div>
    )
}

export default Leaderboard
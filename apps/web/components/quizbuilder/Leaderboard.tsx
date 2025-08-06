import { IQuizBuilderStages, QuizLeaderboard, QuizLeaderboardProps } from '@/types/types'
import React, { useEffect, useState } from 'react'
import UserScoreCard from '../leaderboard/UserScoreCard'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import useQuizStore from '@/store/quizStore'

const Leaderboard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
    const [leaderboard, setLeaderboard] = useState<QuizLeaderboard[]>([])
    const activeQuiz = useQuizStore((s) => s.activeQuiz)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;
    useJoinRoomSocket({socket, roomId, userId: user?.id})

    useEffect(() => {

        const handleLeaderboardReveal = (data: QuizLeaderboardProps) => {
            setLeaderboard(data.leaderboard)
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
    return (
        <div className='flex flex-col absolute top-12 bottom-2 left-0 right-0 p-2'>
            <div className="overflow-y-auto grid grid-cols-1 gap-1.5">
                {leaderboard.map((entry, idx) => <UserScoreCard key={idx} rank={entry.rank} userId={entry.userId} name={entry.name} score={entry.score} total={totalQuestions} />)}
            </div>
        </div>
    )
}

export default Leaderboard
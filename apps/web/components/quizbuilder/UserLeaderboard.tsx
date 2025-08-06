import { QuizLeaderboard } from '@/types/types'
import React from 'react'
import UserScoreCard from '../leaderboard/UserScoreCard'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import useQuizStore from '@/store/quizStore'
import SpecialCard from '../leaderboard/SpecialCard'

const UserLeaderboard = ({leaderboard}: {leaderboard: QuizLeaderboard[]}) => {
    const activeQuiz = useQuizStore((s) => s.activeQuiz)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;
    useJoinRoomSocket({socket, roomId, userId: user?.id})
    
    const userEntry = leaderboard.find(entry => entry.userId === user?.id)

    const renderSpecialCard = () => {
        if(!userEntry || userEntry.rank > 3) return null;


        return (
            <div className="mb-2">
                <SpecialCard
                    rank={userEntry.rank}
                    name={userEntry.name}
                    score={userEntry.score}
                    total={totalQuestions}
                />
            </div>
        );
    }

    return (
        <div className='flex flex-col top-12 bottom-2 left-0 right-0 p-2'>
            <div className="overflow-y-auto grid grid-cols-1 gap-1.5">
                {renderSpecialCard()}
                {leaderboard.map((entry) => <UserScoreCard key={entry.userId} rank={entry.rank} userId={entry.userId} name={entry.name} score={entry.score} total={totalQuestions} />)}
            </div>
        </div>
    )
}

export default UserLeaderboard
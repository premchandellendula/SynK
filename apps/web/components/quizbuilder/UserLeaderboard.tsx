import { QuizLeaderboard } from '@/types/types'
import React, { useState } from 'react'
import UserScoreCard from '../leaderboard/UserScoreCard'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import useQuizStore from '@/store/quizStore'
import SpecialCard from '../leaderboard/SpecialCard'
import { Button } from '../ui/button'
import { X } from 'lucide-react'
import Leaderboard from './Leaderboard'
interface IQuizLeaderboardDataUser {
    topThree: QuizLeaderboard[],
    user: QuizLeaderboard
}
const UserLeaderboard = ({leaderboard}: {leaderboard: IQuizLeaderboardDataUser}) => {
    const activeQuiz = useQuizStore((s) => s.activeQuiz)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const [isFullLeaderboardOpen, setIsFullLeaderboardOpen] = useState(false);

    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;
    useJoinRoomSocket({socket, roomId, userId: user?.id})
    
    const userEntry = leaderboard.user;
    const isUserInTop3 = userEntry && userEntry.rank <= 3;

    return (
        <div className='relative'>
            <div className='flex flex-col top-12 bottom-12 left-0 right-0 p-2'>
                <div className="overflow-y-auto grid grid-cols-1 gap-1.5">
                    {isUserInTop3 && userEntry && (
                        <div className="mb-2">
                            <SpecialCard
                                rank={userEntry.rank}
                                name={userEntry.name}
                                score={userEntry.score}
                                total={totalQuestions}
                            />
                        </div>
                    )}
                    {leaderboard.topThree.map((entry) => <UserScoreCard key={entry.userId} rank={entry.rank} userId={entry.userId} name={entry.name} score={entry.score} total={totalQuestions} />)}

                    {!isUserInTop3 && userEntry && (
                        <UserScoreCard
                            key={userEntry.userId}
                            rank={userEntry.rank}
                            userId={userEntry.userId}
                            name={userEntry.name}
                            score={userEntry.score}
                            total={totalQuestions}
                        />
                    )}
                </div>
            </div>
            <div className='fixed bottom-0 h-12 flex items-center gap-2 px-2'>
                <Button
                    variant={"outline"}
                    className='px-4 py-2 rounded-sm disabled:opacity-50'
                    onClick={() => {
                        setIsFullLeaderboardOpen(true)
                        document.body.style.overflow = 'hidden'
                    }}
                >
                    View full leaderboard
                </Button>
            </div>

            {isFullLeaderboardOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" 
                    role="dialog" 
                    aria-modal="true" 
                    aria-labelledby="leaderboard-title"
                >
                    <div className="bg-background w-full max-w-3xl h-[90vh] border border-input mt-12 rounded-md shadow-lg flex flex-col relative">
                        <div className="flex items-center justify-between px-2 py-2 border-b border-border">
                            <h2 className="text-lg font-semibold">Leaderboard</h2>
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                className="p-2 rounded-md cursor-pointer"
                                onClick={() => {
                                    setIsFullLeaderboardOpen(false)
                                    document.body.style.overflow = 'unset'
                                }}
                                aria-label="Close leaderboard"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <Leaderboard setStep={() => {}} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserLeaderboard
import { QuizLeaderboard } from '@/types/types'
import React from 'react'
import UserScoreCard from '../leaderboard/UserScoreCard'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import useQuizStore from '@/store/quizStore'
import SpecialCard from '../leaderboard/SpecialCard'
interface IQuizLeaderboardDataUser {
    topThree: QuizLeaderboard[],
    user: QuizLeaderboard
}
const UserLeaderboard = ({leaderboard}: {leaderboard: IQuizLeaderboardDataUser}) => {
    const activeQuiz = useQuizStore((s) => s.activeQuiz)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;
    useJoinRoomSocket({socket, roomId, userId: user?.id})
    
    const userEntry = leaderboard.user;
    const isUserInTop3 = userEntry && userEntry.rank <= 3;

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
    )
}

export default UserLeaderboard

/*

const UserLeaderboard = ({ leaderboard }: { leaderboard: QuizLeaderboard[] }) => {
    const activeQuiz = useQuizStore((s) => s.activeQuiz);
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId);
    const { user } = useUser();
    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;

    useJoinRoomSocket({ socket, roomId, userId: user?.id });

    const userEntry = leaderboard.find(entry => entry.userId === user?.id);
    const isUserInTop3 = userEntry && userEntry.rank <= 3;

    const topThree = leaderboard.filter(entry => entry.rank <= 3);

    return (
        <div className='flex flex-col top-12 bottom-2 left-0 right-0 p-2'>
            <div className="overflow-y-auto grid grid-cols-1 gap-1.5">

                // Special card if user is in top 3 
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

                // Always show top 3
                {topThree.map(entry => (
                    <UserScoreCard
                        key={entry.userId}
                        rank={entry.rank}
                        userId={entry.userId}
                        name={entry.name}
                        score={entry.score}
                        total={totalQuestions}
                    />
                ))}

                // If user is not in top 3, show their own card separately
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
    );
};

*/
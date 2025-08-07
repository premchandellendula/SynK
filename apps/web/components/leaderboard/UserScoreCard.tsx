import { useUser } from '@/hooks/useUser';
import { cn, getFunBg } from '@/lib/utils';
import React from 'react';

interface UserScoreCardProps {
    rank: number,
    userId: string,
    name: string,
    score: number,
    total: number
}

const UserScoreCard = ({ rank, userId, name, score, total }: UserScoreCardProps) => {
    const { user } = useUser();
    const scorePercentage = (score / total) * 100;

    const scoreColor =
        scorePercentage >= 77
            ? 'text-green-600'
            : scorePercentage >= 48
            ? 'text-yellow-500'
            : 'text-red-500';

    const isCurrentUser = userId === user?.id;

    return (
        <div className={`flex items-center justify-between bg-input/30 border border-input/50 rounded-sm px-4 py-3 transition-all hover:bg-input/40`}>
            <div className="flex items-center gap-2">
                <div className={cn("text-sm font-bold bg-muted text-foreground w-8 h-8 flex items-center justify-center rounded-full", getFunBg(rank))}>
                    {rank}
                </div>
                <p className="text-lg font-medium text-foreground">
                    {name} {isCurrentUser && <span className="text-base text-green-600 font-semibold">(me)</span>}
                </p>
            </div>
            <p className="text-lg font-medium">
                <span className={`${scoreColor}`}>{score}</span>
                <span className="text-foreground"> / {total}</span>
            </p>
        </div>
    );
};

export default UserScoreCard;

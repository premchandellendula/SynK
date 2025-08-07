import React from 'react';
interface SpecialCardProps {
    rank: number,
    name: string,
    score: number,
    total: number
}

const getSup = (rank: number) => {
    const suffixes: { [key: number]: string } = {
        1: 'st',
        2: 'nd',
        3: 'rd',
    };
    return suffixes[rank] || 'th';
}

const getEmoji = (rank: number) => {
    switch (rank) {
        case 1: return "🥇";
        case 2: return "🥈";
        case 3: return "🥉";
        default: return "👏";
    }
}

const getPraise = (rank: number) => {
    switch (rank) {
        case 1: return "Excellent work";
        case 2: return "Good job";
        case 3: return "Nice effort";
        default: return "Nice try";
    }
}

const SpecialCard = ({ rank, name, score, total }: SpecialCardProps) => {
    const percentage = Math.round((score / total) * 100);
    const superset = getSup(rank)
    const emoji = getEmoji(rank);
    const praise = getPraise(rank);

    return (
        <div className="flex flex-col items-center">
            <div className='text-[90px]'>
                {emoji}
            </div>
            <p className='text-lg font-semibold'>You finished {rank}<sup>{superset}</sup></p>
            <p className='text-lg font-semibold text-center'>{praise}, {name}!</p>
            <div className="text-end inline-block">
                <div className="flex justify-between w-44 mt-2">
                    <span>Correct answers:</span>
                    <span>{score}/{total}</span>
                </div>
                <div className="flex justify-between w-44 ">
                    <span>Percentage:</span>
                    <span>{percentage}%</span>
                </div>
            </div>
        </div>
    );
};

export default SpecialCard;

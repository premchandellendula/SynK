import { useSocket } from '@/hooks/useSocket'
import { useUser } from '@/hooks/useUser'
import { timeAgo } from '@/lib/utils'
import useQuestionStore from '@/store/questionStore'
import { Question, UpVote } from '@/types/types'
import clsx from 'clsx'
import { ThumbsUp } from 'lucide-react'
import React, { useEffect } from 'react'
import { motion } from 'motion/react'

const QuestionCard = ({question}: {question: Question}) => {
    const socket = useSocket();
    const { setQuestions } = useQuestionStore();
    const { user } = useUser();

    useEffect(() => {
        const handleVoteUpdate = ({questions}: {questions: Question[]}) => {
            // console.log("vote-question-updated received:", questions);
            setQuestions(questions)
        };
        
        socket.on("vote-question-updated", handleVoteUpdate);
        
        return () => {
            socket.off("vote-question-updated", handleVoteUpdate);
        };
    }, [socket, setQuestions]);

    if(!user) return null;

    const hasVoted = Array.isArray(question.upVotes)
        ? question.upVotes.some((vote) => vote.userId === user.id)
        : false;

    const handleQuestionVote = () => {
        socket.emit("vote-question", {
            questionId: question.id,
            roomId: question.roomId,
            userId: user?.id
        })
    }

    return (
        <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className='rounded-md w-full shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-4 py-3 mt-1 border border-input'>
            <div className='mb-2 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 bg-input rounded-full flex justify-center items-center'>{question.sender.name[0]?.toUpperCase()}</div>
                    <div className='flex flex-col'>
                        <span className='text-[15px] font-semibold'>{question.sender.name}</span>
                        <span className='text-[14px] text-neutral-500'>
                            {timeAgo(question.createdAt)}
                        </span>
                    </div>
                </div>
                <div 
                    onClick={handleQuestionVote} 
                    className={clsx(
                            "flex items-center gap-2 bg-input hover:bg-input/80 px-4 h-8 rounded-full cursor-pointer transition",
                            hasVoted && "bg-primary text-white",
                            hasVoted && "hover:bg-primary/90 text-white"
                        )}>
                    <span>{question.upVotes.length}</span>
                    <ThumbsUp size={15} className={clsx("text-foreground", hasVoted && "text-white")} />
                </div>
            </div>
            <span>{question.question}</span>
        </motion.div>
    )
}

export default QuestionCard
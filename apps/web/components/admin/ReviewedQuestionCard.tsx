import { Check, ThumbsUp, Undo, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { AnimatePresence, easeIn, easeOut, motion } from 'motion/react';
import { Question } from '@/types/types';
import { timeAgo } from '@/lib/utils';
import useQuestionStore from '@/store/questionStore';
import { useSocket } from '@/hooks/useSocket';
import { QuestionStatus } from '@repo/db';
import useRoomStore from '@/store/roomStore';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

const icons = [
    {
        icon: <Undo size={16} />,
        tooltip: "Undo the question",
        statusKey: QuestionStatus.PENDING
    }
]
const ReviewedQuestionCard = ({question}: {question: Question}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { setQuestions, setArchiveQuestions, setIgnoredQuestions } = useQuestionStore();
    const socket = useSocket();
    const roomId = useRoomStore((s) => s.room?.roomId)
    const {user} = useUser();

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

    useEffect(() => {
        const handleQStatusUpdate = ({questions, archiveQuestions, ignoredQuestions}: {questions: Question[], archiveQuestions: Question[], ignoredQuestions: Question[]}) => {
            // console.log("question-status-changed event happens: ", questions, archiveQuestions, ignoredQuestions)
            setQuestions(questions)
            setArchiveQuestions(archiveQuestions)
            setIgnoredQuestions(ignoredQuestions)
        };
        
        socket.on("question-status-changed", handleQStatusUpdate);
        
        return () => {
            socket.off("question-status-changed", handleQStatusUpdate);
        };
    }, [socket, setQuestions, setArchiveQuestions, setIgnoredQuestions]);

    useEffect(() => {
        const handleError = ({ message }: { message: string }) => {
            toast.error("Error updating the status")
            console.error("Question status error:", message);
        };

        socket.on("question-status-error", handleError);

        return () => {
            socket.off("question-status-error", handleError);
        };
    }, [socket]);

    const handleQuestionStatusUpdate = (status: QuestionStatus) => {
        const currentQuestions = useQuestionStore.getState().questions;
        const updatedQuestions = currentQuestions.filter(q => q.id !== question.id);
        useQuestionStore.getState().setQuestions(updatedQuestions);
        socket.emit("change-question-status" , {
            roomId: roomId,
            userId: user?.id,
            questionId: question.id,
            status: status
        })
    }
    
    const divVariant = {
        open: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.25, ease: easeOut }
        },
        closed: {
            opacity: 0.5,
            y: -4,
            transition: { duration: 0.2, ease: easeIn }
        }
    }
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className='relative w-full shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-4 py-3 bg-input/30 border-y border-input/20 hover:border-y hover:border-input/70'
        >
            <div className='mb-2 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <div className='h-6 w-6 bg-input rounded-full flex justify-center items-center'>{question.sender.name[0]?.toUpperCase()}</div>
                    <span className='text-[15px]'>{question.sender.name}</span>
                    <span className='text-[14px] text-neutral-500'>{timeAgo(question.createdAt)}</span>
                </div>
                <div className='flex items-center gap-2 h-8 rounded-full cursor-pointer'>
                    <span>{question.upVotes.length}</span>
                    <ThumbsUp size={14} className='text-neutral-700' />
                </div>
            </div>
            <span>{question.question}</span>

            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                    key="actions"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={divVariant}
                    transition={{ duration: 0.1 }}
                    className='absolute bg-input/30 right-14 top-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-full flex gap-1.5 px-3 py-1'>
                        {icons.map((icon, idx) => (
                            <div key={idx} className='hover:bg-input/60 px-2 py-2 rounded-full flex justify-center items-center cursor-pointer'>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <p onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuestionStatusUpdate(icon.statusKey)
                                        }}>
                                            {icon.icon}
                                        </p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {icon.tooltip}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ReviewedQuestionCard
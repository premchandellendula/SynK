import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { IQuizBuilderStages, Quiz, QuizOption, QuizQuestion } from '@/types/types'
import useQuizStore from '@/store/quizStore'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import { toast } from 'sonner'
import { getQuestionState } from '@/lib/utils'

const AdminQuestionCard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
    const currentQuestion = useQuizStore((s) => s.currentQuestion);
    const activeQuiz = useQuizStore((s) => s.activeQuiz);
    const updateQuizOptionVotes = useQuizStore((s) => s.updateQuizOptionVotes);
    const setCurrentQuestion = useQuizStore((s) => s.setCurrentQuestion);
    const setActiveQuiz = useQuizStore((s) => s.setActiveQuiz);
    const setActiveQuestion = useQuizStore((s) => s.setActiveQuestion);

    // console.log("currentQuestion store:", currentQuestion)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useJoinRoomSocket({socket, roomId, userId: user?.id})
    
    const totalVotes = currentQuestion?.quizOptions.reduce(
        (acc, opt) => acc + (opt.voteCount || 0),
        0
    ) ?? 0;

    const isLastQuestion = currentQuestion?.order === (activeQuiz?.quizQuestions.length ?? 0) - 1;
    const isAnswerRevealed = currentQuestion?.isAnswerRevealed;

    useEffect(() => {
        if(!currentQuestion?.timerSeconds || !currentQuestion.questionStartedAt) return;
        console.log(currentQuestion.questionStartedAt)
        const { remainingSeconds } = getQuestionState(currentQuestion);
        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if(prev === null) return null;
                if(prev <= 1){
                    clearInterval(interval)
                    setTimeLeft(null);
                    return 0;
                }
                return prev - 1;
            })
        }, 1000)

        return () => clearInterval(interval);
    }, [currentQuestion?.id, currentQuestion?.questionStartedAt])

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleCurrentQuestionSet = (data: { question: QuizQuestion; quiz: Quiz }) => {
            console.log("hello:", data.question);
            setActiveQuiz(data.quiz);
            setCurrentQuestion(data.question)
        };

        const handleAnsweredQuizQuestion = (data: {
            quizQuestionId: string;
            quizId: string;
            quizOptionVotes: QuizOption[];
        }) => {
            updateQuizOptionVotes(data.quizQuestionId, data.quizId, data.quizOptionVotes);
        };

        const handleAnswerRevealed = (data: { question: QuizQuestion; correctOptionId: QuizOption }) => {
            setCurrentQuestion({ ...data.question });
        };

        const attachListener = () => {
            socket.on('current-question-set', handleCurrentQuestionSet);
            socket.on('answered-quiz-question', handleAnsweredQuizQuestion);
            socket.on('answer-revealed', handleAnswerRevealed);
        };
        
        if (socket.connected) {
            attachListener();
        }
        
        socket.on("connect", attachListener);
        return () => {
            socket.off('current-question-set', handleCurrentQuestionSet);
            socket.off('answered-quiz-question', handleAnsweredQuizQuestion);
            socket.off('answer-revealed', handleAnswerRevealed);
            socket.off("connect", attachListener)
        };

    }, [socket, roomId, setActiveQuiz, setCurrentQuestion, updateQuizOptionVotes]);

    const handleNextQuestion = () => {
        try {
            if(!activeQuiz || !currentQuestion) return;
            const nextOrder = currentQuestion.order + 1;

            const nextQuestion = activeQuiz.quizQuestions?.find(q => q.order === nextOrder);

            if (!nextQuestion) {
                toast.error("No more questions left!");
                return;
            }

            setActiveQuestion(nextQuestion);
            
            socket.emit("set-current-question", {
                quizId: activeQuiz.id,
                userId: user?.id,
                roomId,
                quizQuestionId: nextQuestion.id
            })

        }catch(err) {
            console.error('Failed to set the current question:', err);
        }
    }
    const handleRevealAnswer = () => {
        try {
            if(!activeQuiz || !currentQuestion) return;
            
            socket.emit("reveal-answer", {
                quizId: activeQuiz.id,
                userId: user?.id,
                roomId,
                quizQuestionId: currentQuestion?.id
            })

        } catch (err) {
            console.log("Error revealing the answer: ", err)
        }
    }

    const handleRevealLeaderboard = () => {
        try {
            if(!activeQuiz || !currentQuestion) return;

            socket.emit("reveal-leaderboard", {
                quizId: activeQuiz.id,
                roomId,
                userId: user?.id
            })

            setStep("leaderboard")
        } catch(err) {
            console.log("Error revealing the leaderboard: ", err)
        }
    }

    useEffect(() => {
        console.log("currentQuestion updated", currentQuestion);
    }, [currentQuestion]);
    return (
        <>
            <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
                <div className='flex justify-between'>
                    <span className='font-medium'>Question {(currentQuestion?.order ?? 0 + 1) || 1}</span>
                </div>
                <p className='text-2xl font-semibold text-foreground/90 border border-input rounded-sm p-4 h-22 flex items-center'>
                    {currentQuestion?.question || 'What would you like to ask?'}
                </p>
                {currentQuestion?.quizOptions.map((option, i) => {
                    const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0
                    
                    return (
                        <div key={i} className='flex flex-col gap-1.5 w-full border border-input p-4 rounded-sm'>
                            <div className='flex justify-between text-sm text-foreground/80'>
                                <span 
                                    className={`text-base truncate max-w-[70%] ${currentQuestion.isAnswerRevealed && option.isCorrect ? 'text-green-600 font-semibold' : ''}`}
                                    title={option.text}
                                    >{option.text}</span>
                                <span>{option.voteCount} votes • {Math.round(percentage)}%</span>
                            </div>
                            <div className='relative w-full h-3 bg-secondary rounded-sm overflow-hidden'>
                                <div
                                    className='absolute top-0 left-0 h-full bg-primary rounded-sm transition-all duration-300'
                                    style={{ width: `${percentage}%` }}
                                    role="progressbar"
                                    aria-valuenow={percentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    />
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-input/20 flex items-center gap-2 px-4">
                {/* {JSON.stringify(currentQuestion)} */}
                {/* {currentQuestion?.isAnswerRevealed === true && <p className="text-sm mr-2">✅ Answer revealed</p>} */}

                <Button
                    variant={"default"}
                    className='px-4 py-2 rounded-sm disabled:opacity-50'
                    onClick={isAnswerRevealed ? handleNextQuestion : handleRevealAnswer}
                    disabled={isLastQuestion && isAnswerRevealed}
                >
                    {isAnswerRevealed ? "Next Question" : "Reveal Answer"}
                </Button>
                
                {isLastQuestion && isAnswerRevealed && (
                    <Button
                        variant={"secondary"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                        onClick={handleRevealLeaderboard}
                    >
                        Reveal Leaderboard
                    </Button>
                )}
                
                {timeLeft !== null && (
                    <Button 
                        variant={"outline"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                    >
                        Closes in {timeLeft}s
                    </Button>
                )}
            </div>
        </>
    )
}

export default AdminQuestionCard
import React, { useEffect } from 'react'
import { Button } from '../ui/button'
import { IQuizBuilderStages, Quiz, QuizOption, QuizQuestion } from '@/types/types'
import useQuizStore from '@/store/quizStore'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'

const AdminQuestionCard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
    const currentQuestion = useQuizStore((s) => s.currentQuestion);
    const activeQuiz = useQuizStore((s) => s.activeQuiz);
    const updateQuizOptionVotes = useQuizStore((s) => s.updateQuizOptionVotes);
    const setCurrentQuestion = useQuizStore((s) => s.setCurrentQuestion);
    const setActiveQuiz = useQuizStore((s) => s.setActiveQuiz);

    // console.log("currentQuestion store:", currentQuestion)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();

    useJoinRoomSocket({socket, roomId, userId: user?.id})
    
    const totalVotes = currentQuestion?.quizOptions.reduce(
        (acc, opt) => acc + (opt.voteCount || 0),
        0
    ) ?? 0;

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleCurrentQuestionSet = (data: { question: QuizQuestion; quiz: Quiz }) => {
            setActiveQuiz(data.quiz);
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
        console.log('Next Question clicked')
    }
    const handleRevealAnswer = () => {
        try {
            if(!activeQuiz) return;
            const current = currentQuestion;
            if (!current) return;
            
            socket.emit("reveal-answer", {
                quizId: activeQuiz.id,
                userId: user?.id,
                roomId,
                quizQuestionId: current?.id
            })

        } catch (err) {
            console.log("Error revealing the answer: ", err)
        }
    }

    useEffect(() => {
        console.log("currentQuestion updated", currentQuestion);
    }, [currentQuestion]);
    return (
        <>
            <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
                <div className='flex justify-between'>
                    <span className='font-medium'>Question 1</span>
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
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-input/20 flex items-center px-2">
                {/* {JSON.stringify(currentQuestion)} */}
                {/* {currentQuestion?.isAnswerRevealed === true && <p className="text-sm mr-2">✅ Answer revealed</p>} */}

                {currentQuestion?.isAnswerRevealed ? (
                    <Button
                        variant={"default"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                        onClick={handleNextQuestion}
                    >
                        Next Question
                    </Button>
                ) : (
                    <Button
                        variant={"default"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                        onClick={handleRevealAnswer}                        
                    >
                        Reveal Answer
                    </Button>
                )}
            </div>
        </>
    )
}

export default AdminQuestionCard
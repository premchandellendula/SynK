import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Interaction, Quiz, QuizOption, QuizQuestion } from '@/types/types'
import useQuizStore from '@/store/quizStore'
import { Input } from '../ui/input'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useSocket } from '@/hooks/useSocket'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'

const QuizQuestionCardUser = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const [selected, setSelected] = useState<string | null>(null)
    const [name, setName] = useState<string>("")
    const { activeQuiz, checkAndRestoreUser, hasJoined, setHasJoined, participantName, setActiveQuiz, setActiveQuestion, currentQuestion } = useQuizStore();
    const [timeLeft, setTimeLeft] = useState<number | null>(null); 
    const currentQuizQuestion = activeQuiz?.currentQuestion;
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const socket = useSocket();
    const [revealedAnswerId, setRevealedAnswerId] = useState<string | null>(null)
    const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)

    useJoinRoomSocket({socket, roomId, userId: user?.id})

    const handleJoinQuiz = () => {
        if(!name){
            toast.warning("Please enter a name")
            return;
        }

        try {
            socket.emit("join-quiz", {
                roomId,
                userId: user?.id,
                quizId: activeQuiz?.id,
                name
            })

            setHasJoined(true)
        } catch(err) {
            console.log("Failed to join a quiz: ", err)
        }
    }

    useEffect(() => {
        if (!currentQuestion?.timerSeconds) return;

        setTimeLeft(currentQuestion.timerSeconds);
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentQuestion?.id]);

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleQuestionStarted = (data: {question: QuizQuestion}) => {
            setActiveQuestion(data.question)
        }

        socket.on("question-started", handleQuestionStarted);

        return () => {
            socket.off("question-started", handleQuestionStarted);
        }
    }, [socket, roomId]);

    useEffect(() => {
        if (!socket) return;
        const handleQuizQuestionAnswerRevealed = ({question, correctOptionId}: {question: QuizQuestion, correctOptionId: QuizOption}) => {
            console.log("connected answer-revealed", question)
            console.log("connected answer-revealed correctOption", correctOptionId)
            setRevealedAnswerId(correctOptionId.id)
            setShowAnswerFeedback(true)
        };
        
        const attachListener = () => {
            socket.on("answer-revealed", handleQuizQuestionAnswerRevealed)
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);
        return () => {
            socket.off("connect", attachListener);
            socket.off("answer-revealed", handleQuizQuestionAnswerRevealed)
        }
    }, [socket, activeQuiz?.id])

    useEffect(() => {
        const fetchCurrentQuestion = async () => {
            const response = await axios.get(`/api/room/${roomId}/quizzes/${activeQuiz?.id}/questions/active`, {
                withCredentials: true
            })

            setActiveQuestion(response.data.quizQuestion)
        } 
        fetchCurrentQuestion()
    }, [])

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleUserJoined = (data: { question: QuizQuestion, quiz: Quiz}) => {
            console.log("🚀 Received current-question-set:", data);
            const { question, quiz } = data;
            setActiveQuiz(quiz);
            setActiveQuestion(question);
        };

        const attachListener = () => {
            socket.on("current-question-set", handleUserJoined);
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);

        return () => {
            socket.off("current-question-set", handleUserJoined);
            socket.off("connect", attachListener);
        };
    }, [socket, setActiveQuiz]);

    useEffect(() => {
        if (user?.id && activeQuiz?.id) {
            checkAndRestoreUser(user.id, activeQuiz.id);
        }
    }, [user?.id, activeQuiz?.id]);

    const handleQuizQuestionVote = () => {
        try {
            if (!selected) {
                toast.warning("Please select an option")
                return;
            }
            alert("hi")
            socket.emit("quiz-answer", {
                quizId: activeQuiz?.id,
                quizQuestionId: currentQuestion?.id,
                quizOptionId: selected,
                roomId,
                userId: user?.id
            });

        } catch(err) {
            console.error('Failed to add vote:', err);
        }
    }

    if(!activeQuiz){
        return (
            <div className='flex flex-col justify-center items-center mt-20'>
                <h3 className='text-foreground text-lg'>No Active Quiz</h3>
                <Button className='rounded-full mt-2' onClick={() => setInteraction("qna")}>Move To Q&A</Button>
            </div>
        )
    }
    if(!hasJoined){
        return (
            <div className='flex flex-col items-center justify-center mt-6'>
                <Input 
                    placeholder='Enter your name' 
                    onChange={(e) => setName(e.target.value)} 
                    className='h-14 text-lg'    
                />
                <Button className='rounded-full mt-4' onClick={handleJoinQuiz}>Join Quiz</Button>
            </div>
        )
    }

    if(hasJoined && !currentQuizQuestion){
        return (
            <div className='flex flex-col items-center justify-center mt-10 text-center px-4'>
                <h3 className='text-foreground text-[1.4rem] font-semibold mb-2'>{participantName || name}, you&apos;ve joined the room!</h3>
                <p className='text-muted-foreground mb-3 text-base'>
                    Hang tight! The quiz will begin once everyone&apos;s ready.
                </p>
                <div className='animate-pulse text-sm text-muted-foreground'>
                    Waiting for host to begin...
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
                <div className='flex justify-between items-center'>
                    <p className='text-lg'>{currentQuestion?.question}</p>
                    {timeLeft !== null && (
                        <span className='text-sm text-muted-foreground'>
                            ⏱ {timeLeft}s
                        </span>
                    )}
                </div>
                {currentQuestion?.quizOptions.map((option, i) => {
                    const isSelected = selected === option.id;
                    const isCorrect = option.id === revealedAnswerId;
                    const isWrongSelection = isSelected && !isCorrect;

                    let optionStyle = "bg-input/70 text-foreground";
                    if (showAnswerFeedback) {
                        if (isCorrect) {
                            optionStyle = "bg-green-700 text-white";
                        } else if (isWrongSelection) {
                            optionStyle = "bg-red-700 text-white";
                        }
                    } else if (isSelected) {
                        optionStyle = "bg-green-800 text-white";
                    }
                    return (
                        <label 
                            key={i} 
                            className={cn(
                                "rounded-md p-2 flex items-center gap-1.5 cursor-pointer transition-colors bg-input/70 text-foreground", 
                                isSelected && 'bg-green-800 text-white',
                                showAnswerFeedback && isCorrect && 'bg-green-700 text-white',
                                showAnswerFeedback && isWrongSelection && 'bg-red-700 text-white',
                            )}>
                            <input 
                                type="radio" 
                                name='poll' 
                                className={`appearance-none w-3 h-3 rounded-full border-2 ${isSelected? "border-white": "border-green-600"} checked:bg-green-800`} 
                                onChange={() => setSelected(option.id)} 
                                checked={isSelected}  
                                disabled={showAnswerFeedback}
                            />
                            <span className='text-base'>{option.text}</span>
                        </label>
                    )
                })}
            </div>
            {showAnswerFeedback && (
                <div className='text-center mt-2'>
                    {selected === revealedAnswerId ? (
                        <p className='text-green-600 font-semibold text-lg'>
                            Smart choice — that was spot on.
                        </p>

                    ) : (
                        <p className='text-red-600 font-semibold text-lg'>
                            Oops! That wasn’t the right one. Don’t give up!
                        </p>
                    )}
                </div>
            )}
            <div className='flex items-center justify-center mt-4'>
                <Button className='w-20 text-base' disabled={timeLeft === 0 || showAnswerFeedback} onClick={handleQuizQuestionVote}>Submit</Button>
            </div>
        </div>
    )
}

export default QuizQuestionCardUser
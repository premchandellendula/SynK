import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Interaction, Quiz, QuizLeaderboard, QuizOption, QuizQuestion } from '@/types/types'
import useQuizStore from '@/store/quizStore'
import { Input } from '../ui/input'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useSocket } from '@/hooks/useSocket'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import { toast } from 'sonner'
import axios from 'axios'
import { cn, getQuestionState } from '@/lib/utils'
import UserLeaderboard from '../quizbuilder/UserLeaderboard'

interface IQuizLeaderboardDataUser {
    topThree: QuizLeaderboard[],
    user: QuizLeaderboard
}

const QuizQuestionCardUser = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const currentQuestion = useQuizStore((s) => s.currentQuestion);
    // console.log("currentQuestion: ", currentQuestion);
    const activeQuiz = useQuizStore((s) => s.activeQuiz);
    const setActiveQuiz = useQuizStore((s) => s.setActiveQuiz);
    const setActiveQuestion = useQuizStore((s) => s.setActiveQuestion);
    const setCurrentQuestion = useQuizStore((s) => s.setCurrentQuestion);
    const setHasVotedCurrentQuestion = useQuizStore((s) => s.setHasVotedCurrentQuestion)
    const hasVotedCurrentQuestion = useQuizStore((s) => s.hasVotedCurrentQuestion);
    const checkCurrentQuestionAnswered = useQuizStore((s) => s.checkCurrentQuestionAnswered)
    const [selected, setSelected] = useState<string | null>(null)
    const [name, setName] = useState<string>("");
    const { checkAndRestoreUser, hasJoined, setHasJoined, participantName } = useQuizStore();
    const [timeLeft, setTimeLeft] = useState<number | null>(null); 
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const socket = useSocket();
    const [revealedAnswerId, setRevealedAnswerId] = useState<string | null>(null)
    const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)
    const [leaderboardData, setLeaderboardData] = useState<IQuizLeaderboardDataUser>({
        topThree: [],
        user: { userId: "", rank: 0, score: 0, name: "" }
    })

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
        if (!socket || !roomId) return;
        const handleLeaderboardReveal = async (data: {quizId: string, roomId: string, userId: string}) => {
            try {
                const response = await axios.get(`/api/room/${data.roomId}/quizzes/${data.quizId}/leaderboard/user`, {
                    withCredentials: true
                })
                // console.log(response.data)
                setLeaderboardData(response.data)
            } catch(err) {
                console.log("Error fetching the leaderboard: ", err)
            }
        };

        const handleQuizQuestionAnswerRevealed = ({question, correctOptionId}: {question: QuizQuestion, correctOptionId: QuizOption}) => {
            // console.log("connected answer-revealed", question)
            // console.log("connected answer-revealed correctOption", correctOptionId)
            setRevealedAnswerId(correctOptionId.id)
            setShowAnswerFeedback(true)
        };

        const handleCurrentQuestionSet = (data: { question: QuizQuestion, quiz: Quiz}) => {
            // console.log("🚀 Received current-question-set:", data);
            setActiveQuiz(data.quiz);
            setCurrentQuestion(data.question)
            setHasVotedCurrentQuestion(false);
            setSelected(null);
            setRevealedAnswerId(null);
            setShowAnswerFeedback(false);
        };
        
        const attachListener = () => {
            socket.on("leaderboard-revealed", handleLeaderboardReveal)
            socket.on("answer-revealed", handleQuizQuestionAnswerRevealed)
            socket.on("current-question-set", handleCurrentQuestionSet);
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);
        return () => {
            socket.off("connect", attachListener);
            socket.off("leaderboard-revealed", handleLeaderboardReveal)
            socket.off("answer-revealed", handleQuizQuestionAnswerRevealed)
            socket.off("current-question-set", handleCurrentQuestionSet);
        }
    }, [socket, activeQuiz?.id, setActiveQuiz])

    // timer
    useEffect(() => {
        if (!currentQuestion?.timerSeconds || !currentQuestion.questionStartedAt) return;
        
        const { remainingSeconds } = getQuestionState(currentQuestion);
        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 0) return;

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
    }, [currentQuestion?.id, currentQuestion?.questionStartedAt]);

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
        if (user?.id && activeQuiz?.id) {
            checkAndRestoreUser(user.id, activeQuiz.id);
        }
    }, [user?.id, activeQuiz?.id]);

    useEffect(() => {
        if(user?.id && currentQuestion?.id){
            checkCurrentQuestionAnswered(user.id, currentQuestion.id);
            const userVote = currentQuestion.quizVotes.find(vote => vote.userId === user.id)
            // console.log(currentQuestion.quizVotes)
            // console.log("userVote: ", userVote)
            setSelected(userVote?.quizOptionId || null);
            setHasVotedCurrentQuestion(!!userVote)
        }
    }, [user?.id, currentQuestion?.id])

    const handleQuizQuestionVote = () => {
        try {
            if (!selected) {
                toast.warning("Please select an option")
                return;
            }
            
            socket.emit("quiz-answer", {
                quizId: activeQuiz?.id,
                quizQuestionId: currentQuestion?.id,
                quizOptionId: selected,
                roomId,
                userId: user?.id
            });
            setHasVotedCurrentQuestion(true)
            toast.success("Answered the quiz")
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

    if(hasJoined && !currentQuestion){
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

    if(leaderboardData.topThree.length > 0){
        return <UserLeaderboard leaderboard={leaderboardData} />
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

                    return (
                        <label 
                            key={option.id} 
                            className={cn(
                                "rounded-md p-2 flex items-center gap-1.5 cursor-pointer transition-colors bg-input/70 text-foreground", 
                                !hasVotedCurrentQuestion && !showAnswerFeedback && 'cursor-pointer',
                                (hasVotedCurrentQuestion || showAnswerFeedback) && 'cursor-default',
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
                                disabled={showAnswerFeedback || hasVotedCurrentQuestion}
                            />
                            <span className='text-base'>{option.text}</span>
                        </label>
                    )
                })}
            </div>
            {hasVotedCurrentQuestion && !showAnswerFeedback && (
                <p className='text-sm text-muted-foreground text-center mt-2'>
                    You&apos;ve submitted your answer.
                </p>
            )}
            {showAnswerFeedback && (
                <div className='text-center mt-2'>
                    {selected === revealedAnswerId ? (
                        <p className='text-green-600 font-semibold text-lg'>
                            Smart choice — that was spot on.
                        </p>

                    ) : (
                        <p className='text-red-600 font-semibold text-lg'>
                            Oops! That wasn&apos;t the right one. Don&apos;t give up!
                        </p>
                    )}
                </div>
            )}
            <div className='flex items-center justify-center mt-4'>
                <Button className='w-20 text-base' disabled={timeLeft === 0 || showAnswerFeedback || hasVotedCurrentQuestion} onClick={handleQuizQuestionVote}>Submit</Button>
            </div>
        </div>
    )
}

export default QuizQuestionCardUser
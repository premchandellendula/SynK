import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Interaction, QuizQuestion } from '@/types/types'
import useQuizStore from '@/store/quizStore'
import { Input } from '../ui/input'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useSocket } from '@/hooks/useSocket'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import { toast } from 'sonner'

const QuizQuestionCardUser = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const [selected, setSelected] = useState<number | null>(null)
    const [name, setName] = useState<string>("")
    const [hasJoined, setHadJoined] = useState<boolean>(false)
    const { activeQuiz, setCurrentQuestion } = useQuizStore();
    if(!activeQuiz) return;
    const currentQuizQuestion = activeQuiz.currentQuestion;
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const socket = useSocket();
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
                quizId: activeQuiz.id,
                name
            })

            setHadJoined(true)
        } catch(err) {
            console.log("Failed to join a quiz: ", err)
        }
    }

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleQuestionStarted = (data: {question: QuizQuestion}) => {
            setCurrentQuestion(data.question.id, data.question.quizId);
        }

        socket.on("question-started", handleQuestionStarted);

        return () => {
            socket.off("question-started", handleQuestionStarted);
        }
    }, [socket, roomId]);

    if(!activeQuiz){
        return (
            <div className='flex flex-col justify-center items-center mt-24'>
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
                <h3 className='text-foreground text-[1.4rem] font-semibold mb-2'>{name}, you&apos;ve joined the room!</h3>
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
                <p className='text-lg'>What is a war movie?</p>
                {Array.from({ length: 4 }, (_, i) => {
                    const isSelected = selected === i
                    return (
                        <label key={i} className={`rounded-md p-2 flex items-center gap-1.5 cursor-pointer transition-colors ${isSelected ? 'bg-green-800 text-white' : 'bg-input/70 text-foreground'}`}>
                            <input type="radio" name='poll' className={`appearance-none w-3 h-3 rounded-full border-2 ${isSelected? "border-white": "border-green-600"} checked:bg-green-800`} onChange={() => setSelected(i)} checked={isSelected}  />
                            <span className='text-base'>hi</span>
                        </label>
                    )
                })}
            </div>
            <div className='flex items-center justify-center mt-4'>
                <Button className='w-20 text-base'>Send</Button>
            </div>
        </div>
    )
}

export default QuizQuestionCardUser
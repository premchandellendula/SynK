import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { ChevronDown, ChevronUp, EllipsisVertical, Trophy } from 'lucide-react'
import useQuizStore from '@/store/quizStore'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useSocket } from '@/hooks/useSocket'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'
import clsx from 'clsx'
import { Quiz } from '@/types/types'

const Quizzes = () => {
    const { quizzes, setQuizzes, setActiveQuiz, removeQuiz } = useQuizStore();
    const [isChevronDown, setIsChevronDown] = useState(false);
    const roomId = useRoomStore((state) => state.room?.roomId);
    const [openQuizId, setOpenQuizId] = useState<string | null>(null);
    const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('down');
    const quizRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const { user } = useUser();
    const socket = useSocket();
    useJoinRoomSocket({ socket, roomId, userId: user?.id })

    useEffect(() => {
        if (!socket) return;
        const handleQuizDeleted = (data: {quiz: Quiz}) => {
            const { quiz } = data;
            removeQuiz(quiz.id)
        }
        const attachListener = () => {
            socket.on("quiz-removed", handleQuizDeleted)
        }

        if (socket.connected) {
            attachListener();
        }
        socket.on("connect", attachListener)

        return () => {
            socket.off("quiz-removed", handleQuizDeleted);
            socket.off("connect", attachListener);
        };
    }, [socket])

    useEffect(() => {
        const fetchQuizzes = async () => {
            const response = await axios.get(`/api/room/${roomId}/quizzes`, {
                withCredentials: true
            })

            const quizzes = response.data.quizzes;

            setQuizzes(quizzes)
        }
        fetchQuizzes()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-quiz-menu]')) {
                setOpenQuizId(null);
            }
        };

        if (openQuizId) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openQuizId]);

    const handleRelaunchQuiz = (quizId: string) => {}
    const handleDeleteQuiz = (quizId: string) => {
        try{
            socket.emit("remove-quiz", {
                quizId,
                roomId,
                userId: user?.id
            })
        }catch(err){
            console.error("Failed to delete the quiz: ", err)
        }
    }

    return (
        <>
            {quizzes.length > 0 && (
                <div className='my-2'>
                    <span className='text-sm'>Quizzes</span>
                    <div className='flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-4 border border-secondary rounded-sm'>
                        <div className='flex justify-between items-center px-2'>
                            <span>{quizzes.length} Quiz{quizzes.length !== 1 ? "zes" : ""}</span>
                            <button className='bg-input/30 hover:bg-input/50 p-2 rounded-full cursor-pointer' onClick={() => setIsChevronDown(!isChevronDown)}>
                                {isChevronDown ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18}  />
                                )}
                            </button>
                        </div>

                        <AnimatePresence>
                            {isChevronDown && (
                                <motion.div
                                    initial={{height: 0, opacity: 0}}
                                    animate={{height: "auto", opacity: 1}}
                                    exit={{height: 0, opacity: 0}}
                                    transition={{duration: 0.2, ease: "easeInOut"}}
                                    className='flex flex-col gap-2'
                                    style={{overflow: "visible"}}
                                >
                                    {quizzes.map((quiz, idx) => (
                                        <div
                                            key={quiz.id || idx}
                                            className="relative" 
                                            ref={(el) => {
                                                quizRefs.current[quiz.id] = el;
                                            }}
                                            data-quiz-menu
                                        >
                                            <motion.div
                                                initial={{opacity: 0}}
                                                animate={{opacity: 1}}
                                                exit={{opacity: 0}}
                                                transition={{duration: 0.2, ease: "easeInOut"}}
                                                layout
                                                className='flex justify-between items-center border border-input/70 hover:border hover:border-input p-2 rounded-sm'
                                            >
                                                <span>{quiz.quizName}</span>
                                                <Button
                                                    size={"icon"}
                                                    className='rounded-full bg-transparent hover:bg-secondary/80'
                                                    onClick={() => {
                                                        const el = quizRefs.current[quiz.id]
                                                        if(el){
                                                            const rect = el.getBoundingClientRect()

                                                            const windowHeight = window.innerHeight;
                                                            if(windowHeight - rect.height < 150){
                                                                setMenuDirection("up")
                                                            }else{
                                                                setMenuDirection("down")
                                                            }
                                                        }
                                                        setOpenQuizId(openQuizId === quiz.id ? null : quiz.id)
                                                    }}
                                                >
                                                    <EllipsisVertical size={15} className='text-foreground' />
                                                </Button>
                                            </motion.div>
                                            {openQuizId === quiz.id && (
                                                <motion.div
                                                    initial={{opacity: 0, y: -5}}
                                                    animate={{opacity: 1, y: 0}}
                                                    exit={{opacity: 0, y: -5}}
                                                    transition={{duration: 0.2, ease: "easeInOut"}}
                                                    className={clsx("absolute z-[9999] right-12 w-48 bg-popover shadow rounded border border-border",
                                                        menuDirection === "up" ? "bottom-2 mb-2" : "top-2 mt-2"
                                                    )}
                                                    style={{
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                                    }}
                                                    data-quiz-menu
                                                >
                                                    <div className='flex flex-col text-sm'>
                                                        <button className="hover:bg-muted px-4 py-2 text-left cursor-pointer" 
                                                            onClick={(e) =>{
                                                                e.stopPropagation();
                                                                handleRelaunchQuiz(quiz.id)
                                                            }}
                                                        >
                                                            Launch Quiz
                                                        </button>
                                                        <button 
                                                            className="hover:bg-muted px-4 py-2 text-left cursor-pointer" 
                                                            onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteQuiz(quiz.id);
                                                                }}
                                                        >
                                                            Delete Quiz
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </>
    )
}

export default Quizzes
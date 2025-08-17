import { IQuizBuilderStages, QuizLeaderboard } from '@/types/types'
import React, { useEffect, useState } from 'react'
import UserScoreCard from '../leaderboard/UserScoreCard'
import { useSocket } from '@/hooks/useSocket'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'
import useQuizStore from '@/store/quizStore'
import axios from 'axios'
import Spinner from '../loaders/Spinner'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import useInteractionStore from '@/store/interactionStore'

interface IQuizLeaderboardData {
    leaderboard: QuizLeaderboard[],
    pagination: {
        page: number,
        limit: number,
        totalCount: number,
        hasNextPage: boolean
    }
}

const getPaginationRange = (current: number, total: number): (number | string)[] => {
    const delta = 1;
    const range: (number | string)[] = [];

    if (total <= 5) {
        for (let i = 1; i <= total; i++) range.push(i)
    } else {
        range.push(1)

        if (current > 3) {
            range.push("...")
        }

        const start = Math.max(2, current - delta);
        const end = Math.min(total - 1, current + delta);

        for (let i = start; i <= end; i++) {
            range.push(i)
        }

        if (current < total - 2) {
            range.push("...")
        }
        range.push(total);
    }

    return range;
}

const Leaderboard = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
    const [leaderboardData, setLeaderboardData] = useState<IQuizLeaderboardData>({
        leaderboard: [],
        pagination: {
            page: 1,
            limit: 10,
            totalCount: 0,
            hasNextPage: false
        }
    })
    const activeQuiz = useQuizStore((s) => s.activeQuiz)
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();
    const totalQuestions = activeQuiz?.quizQuestions.length ?? 0;
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const setActiveQuiz = useQuizStore((s) => s.setActiveQuiz);
    const setInteraction = useInteractionStore((s) => s.setInteraction);
    const [loadingForEndingQuiz, setLoadingForEndingQuiz] = useState(false)

    useJoinRoomSocket({ socket, roomId, userId: user?.id })
    const fetchLeaderboard = async (quizId: string, roomId: string, page = 1, limit = 10) => {
        setLoading(true)
        try {
            const response = await axios.get(`/api/room/${roomId}/quizzes/${quizId}/leaderboard?page=${page}&limit=10`)
            // console.log(response.data)
            setLeaderboardData(response.data)
        } catch (err) {
            console.log("Error fetching the leaderboard: ", err)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        const handleLeaderboardReveal = async (data: { quizId: string, roomId: string, userId: string }) => {
            await fetchLeaderboard(data.quizId, data.roomId, 1);
            setCurrentPage(1)
        }

        const attachListener = () => {
            socket.on("leaderboard-revealed", handleLeaderboardReveal)
        }
        socket.on("connect", attachListener)

        return () => {
            socket.off("connect", attachListener)
            socket.off("leaderboard-revealed", handleLeaderboardReveal)
        }
    }, [socket])

    useEffect(() => {
        if (!activeQuiz?.id || !roomId) return;

        fetchLeaderboard(activeQuiz.id, roomId, currentPage)
    }, [currentPage])

    const totalPages = Math.ceil(leaderboardData.pagination.totalCount / leaderboardData.pagination.limit);
    if (loading) {
        return (
            <div className='flex justify-center items-center h-full'>
                <Spinner />
            </div>
        )
    }

    const handleEndQuiz = () => {
        setLoadingForEndingQuiz(true);
        try {
            if(!activeQuiz) return;
            
            socket.emit("end-quiz", {
                quizId: activeQuiz.id,
                userId: user?.id,
                roomId
            })
            
            setActiveQuiz(null);
            setInteraction("qna")
        }catch(err) {
            console.error('Failed to set the current question:', err);
        }finally{
            setLoadingForEndingQuiz(false);
        }
    }

    return (
        <>
            <div className='flex flex-col absolute top-12 bottom-12 left-0 right-0 p-2'>
                <div className="overflow-y-auto grid grid-cols-1 gap-1.5">
                    {leaderboardData.leaderboard.map((entry) => <UserScoreCard key={entry.userId} rank={entry.rank} userId={entry.userId} name={entry.name} score={entry.score} total={totalQuestions} />)}
                </div>
            </div>
            <div className='absolute bottom-0 left-0 right-0 h-12 bg-input/20 flex items-center justify-between gap-2 px-2'>
                <Button
                    variant={"secondary"}
                    className='px-4 py-2 rounded-sm disabled:opacity-50'
                    onClick={handleEndQuiz}
                >
                    {loadingForEndingQuiz ? (
                        <Spinner />
                    ) : (
                        "End Quiz"
                    )}
                </Button>
                <div className='flex items-center justify-center gap-2 px-2'>
                    <Button
                        size={"icon"}
                        disabled={currentPage === 1}
                        variant={"outline"}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="px-3 py-1 rounded disabled:opacity-60"
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={17} />
                    </Button>
                    {getPaginationRange(currentPage, totalPages).map((page, idx) =>
                        page === "..." ? (
                            <span key={`ellipis-${idx}`} className='px-3 py-1 text-gray-500'>...</span>
                        ) : (
                            <Button
                                key={page}
                                aria-current={page === currentPage ? 'page' : undefined}
                                onClick={() => setCurrentPage(page as number)}
                                className={`px-4 py-1 rounded ${page === currentPage ? "bg-muted hover:bg-muted/80" : "bg-muted/30 hover:bg-muted/40"}`}
                            >
                                {page}
                            </Button>
                        )
                    )}
                    <Button
                        size={"icon"}
                        variant={"outline"}
                        disabled={!leaderboardData.pagination.hasNextPage}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-3 py-1 rounded disabled:opacity-60"
                        aria-label="Next page"
                    >
                        <ChevronRight size={17} />
                    </Button>
                </div>
            </div>
        </>
    )
}

export default Leaderboard
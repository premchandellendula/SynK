import React from 'react'
import { Button } from '../ui/button'
import { ChevronDown, EllipsisVertical, Trophy } from 'lucide-react'
import useQuizStore from '@/store/quizStore'

const Quizzes = () => {
    const { quizzes } = useQuizStore();
    return (
        <>
            {quizzes.length > 0 && (
                <div className='my-2'>
                    <span className='text-sm'>Quizzes</span>
                    <div className='flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-4 border border-secondary rounded-sm'>
                        <div className='flex justify-between items-center'>
                            <span>hehe</span>
                            <Button
                                size={"icon"}
                                className='rounded-full bg-transparent hover:bg-secondary/80'
                            >
                                <EllipsisVertical size={15} className='text-foreground' />
                            </Button>
                        </div>
                        <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-1'>
                                <Trophy size={20} className='text-red-500' />
                                <span>4 questions</span>
                            </div>
                            <Button
                                size={"icon"}
                                className='rounded-full bg-transparent hover:bg-secondary/80'
                            >
                                <ChevronDown size={15} className='text-foreground' />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Quizzes
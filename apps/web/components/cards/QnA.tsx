import { EllipsisVertical, MessageSquareMore } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { Activity } from '@/types/types'

const QnA = ({onClick} : {onClick: () => void}) => {
    return (
        <div
        onClick={onClick}
        className='my-2'>
            <span className='text-sm'>Audience Q&A</span>
            <div className='flex justify-between items-center mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-4 border border-neutral-800 rounded-sm'>
                <div className='flex items-center gap-1.5'>
                    <MessageSquareMore size={20} className='mt-1' />
                    <span>4 questions</span>
                </div>
                <Button
                    size={"icon"}
                    className='rounded-full dark:bg-transparent hover:bg-neutral-900/80'
                >
                    <EllipsisVertical size={15} />
                </Button>
            </div>
        </div>
    )
}

export default QnA
import React from 'react'
import { Button } from '../ui/button'
import { ChartNoAxesColumn, ChevronDown, EllipsisVertical } from 'lucide-react'

const Polls = () => {
    return (
        <div className='my-2'>
            <span className='text-sm'>Polls</span>
            <div className='flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-4 border border-neutral-800 rounded-sm'>
                <div className='flex justify-between items-center'>
                    <span>hehe</span>
                    <Button
                        size={"icon"}
                        className='rounded-full dark:bg-transparent hover:bg-neutral-900/80'
                    >
                        <EllipsisVertical size={15} />
                    </Button>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1'>
                        <ChartNoAxesColumn size={18} />
                        <span>4 votes</span>
                    </div>
                    <Button
                        size={"icon"}
                        className='rounded-full dark:bg-transparent hover:bg-neutral-900/80'
                    >
                        <ChevronDown size={15} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Polls
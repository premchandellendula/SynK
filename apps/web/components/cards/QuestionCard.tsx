import { ThumbsUp } from 'lucide-react'
import React from 'react'

const QuestionCard = () => {
    return (
        <div className='rounded-md w-full shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-4 py-3 mt-4'>
            <div className='mb-2 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 bg-neutral-200 rounded-full flex justify-center items-center'>U</div>
                    <div className='flex flex-col'>
                        <span className='text-[15px] font-semibold'>Anonymous</span>
                        <span className='text-[14px] text-neutral-500'>3 hours ago</span>
                    </div>
                </div>
                <div className='flex items-center gap-2 bg-neutral-100 hover:bg-white hover:shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-4 h-8 rounded-full cursor-pointer'>
                    <span>2</span>
                    <ThumbsUp size={15} className='text-neutral-700' />
                </div>
            </div>
            <span>how about giving remote job?</span>
        </div>
    )
}

export default QuestionCard
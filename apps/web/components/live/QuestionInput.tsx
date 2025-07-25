import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ChevronDown } from 'lucide-react'

const QuestionInput = () => {
    return (
        <div className='mt-4 border border-input rounded-sm p-2'>
            <Input className='h-14 text-4xl border-none shadow-none focus:ring-0 focus-visible:ring-0 focus:outline-none' placeholder='Type your question' />
            <div className='flex justify-between mt-3'>
                <div className='flex items-center gap-1'>
                    <div className='h-8 w-8 bg-neutral-500 rounded-full'></div>
                    <div className='flex'>
                        <span>name</span>
                        <ChevronDown className='mt-1 cursor-pointer' size={20} />
                    </div>
                </div>
                <Button className='w-24 rounded-full'>Send</Button>
            </div>
        </div>
    )
}

export default QuestionInput
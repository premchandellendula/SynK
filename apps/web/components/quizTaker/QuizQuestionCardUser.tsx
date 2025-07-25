import React, { useState } from 'react'
import { Button } from '../ui/button'

const QuizQuestionCardUser = () => {
    const [selected, setSelected] = useState<number | null>(null)
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
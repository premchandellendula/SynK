import usePollStore from '@/store/pollStore'
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Interaction } from '@/types/types';

const Poll = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const [selected, setSelected] = useState<number | null>(null)
    const {polls} = usePollStore();
    return (
        <div className='flex justify-center items-center mt-4'>
            {polls.length > 0 ? (
                <div className='p-4 w-[70%] mx-auto flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-sm border border-input'>
                    
                    <p className='text-xl'>What is a war movie?</p>
                    {Array.from({ length: 4 }, (_, i) => {
                        const isSelected = selected === i
                        return (
                            <label key={i} className={`rounded-md p-2 flex items-center gap-1.5 cursor-pointer transition-colors ${isSelected ? 'bg-green-800 text-white' : 'bg-input text-foreground'}`}>
                                <input type="radio" name='poll' className={`appearance-none w-3 h-3 rounded-full border-2 ${isSelected? "border-white": "border-green-600"} checked:bg-green-800`} checked={isSelected} onChange={() => setSelected(i)} />
                                <span className='text-lg'>hi</span>
                            </label>
                        )
                    })}
                </div>
            ) : (
                <div className='mt-20'>
                    <h3 className='text-foreground text-lg'>No Active Poll</h3>
                    <Button className='rounded-full mt-2' onClick={() => setInteraction("qna")}>Move To Q&A</Button>
                </div>
            )}
        </div>
    )
}

export default Poll
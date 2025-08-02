import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { IQuizQuestion } from '@/types/types'

const QuizQuestionCard = ({onRemove, idx, data, onChange}: {onRemove: (i: number) => void, idx: number, data: IQuizQuestion, onChange: (index: number, updatedData: IQuizQuestion) => void}) => {
    const [questionText, setQuestionText] = useState(data.question || "");
    const [options, setOptions] = useState(data.options || ["", ""]);
    const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(data.correctOptionIndex || 0)

    const handleAddOption = () => {
        if (options.length < 4) {
            setOptions(prev => [...prev, ''])
        }
    }

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(prev => prev.filter((_, i) => i !== index))
        }
    }

    const handleInputChange = (index: number, value: string) => {
        setOptions(prev => {
            const newOptions = [...prev]
            newOptions[index] = value
            return newOptions
        })
    }

    useEffect(() => {
        if (correctOptionIndex !== null) {
            onChange(idx, {
                question: questionText,
                options,
                correctOptionIndex
            });
        }
    }, [questionText, options, correctOptionIndex]);

    return (
        <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
            <div className='flex justify-between'>
                <span className='font-medium'>Question {idx + 1}</span>
                <Tooltip>
                    <div onClick={() => onRemove(idx)} className='p-2 rounded-full'>
                        <TooltipTrigger asChild>
                            <Trash2 size={17} className='hover:text-red-400 cursor-pointer' />
                        </TooltipTrigger>
                    </div>
                    <TooltipContent>
                        Clear question
                    </TooltipContent>
                </Tooltip>
            </div>
            <Input placeholder='What would you like to ask?' className='py-8 text-3xl' onChange={(e) => setQuestionText(e.target.value)}/>
            {options.map((option, i) => (
                <div
                    key={i}
                    className='flex gap-2 items-center'
                >
                    <input type="radio" className='h-4 w-4 rounded-full'
                    checked={correctOptionIndex === i}
                    onChange={() => setCorrectOptionIndex(i)} />
                    <Input
                        value={option}
                        onChange={e => handleInputChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className={`py-3 text-2xl flex-1 ${correctOptionIndex === i ? 'border-green-500' : ''}`}
                    />
                    <Button 
                        variant='ghost'
                        onClick={() => handleRemoveOption(i)}
                        disabled={options.length <= 2}
                        className='bg-input/50 p-2 rounded-sm'
                    >
                        <Minus size={16} className='mt-0.5' />
                    </Button>
                </div>
            ))}

            <div className='flex gap-2 mt-4'>
                <Button
                    onClick={handleAddOption}
                    disabled={options.length >= 4}
                    variant={"ghost"}
                    className='px-4 py-2 rounded-sm disabled:opacity-50'
                >
                    <Plus size={16} />
                    Add Option
                </Button>
            </div>

        </div>
    )
}

export default QuizQuestionCard
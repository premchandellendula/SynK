import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const QuizNameInput = ({setQuizName, quizName, next}: {setQuizName: (val: string) => void, quizName: string, next: () => void}) => {
    return (
        <div className='flex flex-col h-full'>
            <div>
                <Input
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder='Quiz Name'
                    className='py-6 text-3xl w-full'
                />
            </div>
            <div className='h-96 flex flex-col gap-2 justify-center items-center'>
                <p>No Questions yet!!</p>
                <Button disabled={quizName.trim().length === 0} onClick={next}>Add First Question</Button>
            </div>
        </div>
    )
}

export default QuizNameInput
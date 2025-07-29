import React, { useState } from 'react'
import { MenuItemTab } from './AdminQuestionBox'
import { Trash2, Trophy } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import QuizNameInput from '../quizbuilder/QuizNameInput'
import QuizForm from '../quizbuilder/QuizForm'

const AdminQuizBox = () => {
    const [quizName, setQuizName] = useState("");
    const [step, setStep] = useState<number>(0);

    const next = () => {
        setStep(step + 1)
    }
    return (
        <div>
            <div className='flex justify-between items-center h-10 mb-2'>
                <MenuItemTab icon={<Trophy size={20} className='mt-1 text-red-500' />} label='Quiz' />
                <Tooltip>
                    <div className='p-2 rounded-full'>
                        <TooltipTrigger asChild>
                                <Trash2 size={17} className='hover:text-red-400 cursor-pointer' />
                        </TooltipTrigger>
                    </div>
                    <TooltipContent>
                        Clear quiz
                    </TooltipContent>
                </Tooltip>
            </div>
            {step === 0 && <QuizNameInput setQuizName={setQuizName} quizName={quizName} next={next} />}
            {step === 1 && <QuizForm />}
        </div>
    )
}

export default AdminQuizBox
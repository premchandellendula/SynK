import React, { useState } from 'react'
import QuizQuestionCard from './QuizQuestionCard';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

const QuizForm = () => {
    const [questions, setQuestions] = useState([{}]);
    const handleAddQuestion = () => {
        setQuestions(prev => [...prev, {}])
    }

    const handleRemoveQuestion = (indexToRemove: number) => {
        setQuestions(prev => prev.filter((_, index) => index !== indexToRemove));
    }
    return (
        <div>
            <div className='absolute top-12 bottom-12 left-0 right-0 overflow-y-auto p-2'>
                {questions.map((q, idx) => (
                    <QuizQuestionCard key={idx} idx={idx} onRemove={handleRemoveQuestion} />
                ))}

                <div className='flex gap-2 mt-4'>
                    <Button
                        onClick={handleAddQuestion}
                        variant={"ghost"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                    >
                        <Plus size={16} />
                        Add Question
                    </Button>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-700 flex items-center justify-center">
                Section 2 Footer
            </div>
        </div>
    )
}

export default QuizForm
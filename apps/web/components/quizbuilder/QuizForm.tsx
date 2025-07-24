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
    )
}

export default QuizForm
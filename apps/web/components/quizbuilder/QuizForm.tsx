import React, { useState } from 'react'
import QuizQuestionCard from './QuizQuestionCard';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { IQuizBuilderStages, IQuizQuestion } from '@/types/types';
import axios from 'axios';
import useRoomStore from '@/store/roomStore';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket';
import { useUser } from '@/hooks/useUser';
import useQuizStore from '@/store/quizStore';

const QuizForm = ({quizName, setStep} : {quizName: string, setStep: (step: IQuizBuilderStages) => void}) => {
    const [questions, setQuestions] = useState<IQuizQuestion[]>([{
        question: "",
        options: ["", ""],
        correctOptionIndex: 0
    }]);
    const roomId = useRoomStore((state) => state.room?.roomId);
    const socket = useSocket();
    const { user } = useUser();
    const { addQuiz, setActiveQuiz } = useQuizStore();

    useJoinRoomSocket({socket, roomId, userId: user?.id});

    const handleAddQuestion = () => {
        setQuestions(prev => [...prev, {
            question: "",
            options: ["", ""],
            correctOptionIndex: 0
        }])
    }

    const handleQuestionChange = (index: number, updatedData: IQuizQuestion) => {
        setQuestions(prev => {
            const newQuestions = [...prev];
            newQuestions[index] = updatedData;
            return newQuestions;
        });
    };

    const handleRemoveQuestion = (indexToRemove: number) => {
        setQuestions(prev => prev.filter((_, index) => index !== indexToRemove));
    }

    const handleAddNLaunchQuiz = async () => {
        const isValidQuiz = questions.every((q) => {
            if (!q.question.trim()) return false;
            if (q.options.length < 2 || q.options.length > 4) return false;
            if (q.options.some(opt => !opt.trim())) return false;
            if (
                q.correctOptionIndex === null ||
                q.correctOptionIndex < 0 ||
                q.correctOptionIndex >= q.options.length
            ) return false;
            return true;
        });

        if (!isValidQuiz) {
            toast.warning("Please add atleast a full question");
            return;
        }
        try {
            const response = await axios.post(`/api/room/${roomId}/quizzes`, {
                quizName: quizName,
                quizQuestions: questions.map((q) => ({
                    quizQuestion: q.question, 
                    quizOptions: q.options.map((opt,idx) => ({ 
                        text: opt, 
                        isCorrect: q.correctOptionIndex === idx
                    }))
                }))
            }, {withCredentials: true})

            const quiz = response.data.quiz;
            socket.emit("start-quiz", {
                quizId: quiz.id,
                roomId,
                quiz,
                userId: user?.id
            })
            addQuiz(quiz)
            setActiveQuiz(quiz)
            setStep("waiting")
        }catch(err) {
            console.error('Failed to add a new quiz:', err);
        }
    }
    return (
        <div>
            <div className='absolute top-12 bottom-12 left-0 right-0 overflow-y-auto p-2'>
                {questions.map((q, idx) => (
                    q ? (
                        <QuizQuestionCard
                            key={idx}
                            idx={idx}
                            data={q}
                            onChange={handleQuestionChange}
                            onRemove={handleRemoveQuestion}
                        />
                    ) : null
                ))}

                <div className='flex gap-2 mt-4'>
                    <Button
                        onClick={handleAddQuestion}
                        variant={"outline"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                    >
                        <Plus size={16} />
                        Add Question
                    </Button>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-input/20 flex items-center px-2">
                <Button onClick={handleAddNLaunchQuiz}>
                    Start Quiz
                </Button>
            </div>
        </div>
    )
}

export default QuizForm
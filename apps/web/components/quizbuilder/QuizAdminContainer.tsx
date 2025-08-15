import React, { useEffect, useState } from 'react'
import QuizForm from './QuizForm'
import WaitingLobby from './WaitingLobby'
import AdminQuestionCard from './AdminQuestionCard'
import Leaderboard from './Leaderboard'
import { IQuizBuilderStages, Quiz } from '@/types/types'
import { useSocket } from '@/hooks/useSocket'
import useQuizStore from '@/store/quizStore'

const QuizAdminContainer = ({quizName}: {quizName: string}) => {
    const [step, setStep] = useState<IQuizBuilderStages>('build');
    const socket = useSocket();
    const { addQuiz } = useQuizStore();
    const activeQuiz = useQuizStore(s => s.activeQuiz);
    const setCurrentQuestion = useQuizStore(s => s.setCurrentQuestion);

    useEffect(() => {
        if(activeQuiz !== null){
            if(activeQuiz.currentQuestion){
                setStep("question");
                setCurrentQuestion(activeQuiz.currentQuestion)
                return;
            }else{
                setStep("leaderboard")
                return;
            }
        }
    }, [])
    useEffect(() => {
        if (!socket) return;

        const handleAddNewQuiz = (data: { quiz: Quiz}) => {
            console.log("Connected quiz-started: ", data)
            const { quiz } = data;
            addQuiz(quiz);
        };

        const attachListener = () => {
            console.log("hehe")
            socket.on("quiz-started", handleAddNewQuiz);
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);

        return () => {
            socket.off("quiz-started", handleAddNewQuiz);
            socket.off("connect", attachListener);
        };
    }, [socket]);


    return (
        <>
            {step === "build" && <QuizForm quizName={quizName} setStep={setStep} />}
            {step === "waiting" && <WaitingLobby setStep={setStep} />}
            {step === "question" && <AdminQuestionCard setStep={setStep} />}
            {step === "leaderboard" && <Leaderboard setStep={setStep} />}
        </>
    )
}

export default QuizAdminContainer
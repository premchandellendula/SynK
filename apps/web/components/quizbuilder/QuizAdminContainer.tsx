import React, { useState } from 'react'
import QuizForm from './QuizForm'
import WaitingLobby from './WaitingLobby'
import AdminQuestionCard from './AdminQuestionCard'
import Leaderboard from './Leaderboard'
import { IQuizBuilderStages } from '@/types/types'

const QuizAdminContainer = ({quizName}: {quizName: string}) => {
    const [step, setStep] = useState<IQuizBuilderStages>('build')

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
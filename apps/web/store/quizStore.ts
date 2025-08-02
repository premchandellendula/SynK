import { Quiz, QuizParticipant, QuizStore } from "@/types/types";
import { QuizStatus } from "@repo/db";
import { create } from "zustand";

const useQuizStore = create<QuizStore>((set, get) => ({
    quizzes: [],
    activeQuiz: null,
    hasJoined: false,
    participantName: "",
    quizParticipants: [],
    setHasJoined: (hasJoined: boolean) => set({ hasJoined }),
    checkAndRestoreUser: (userId: string, quizId: string) => {
        const activeQuiz = get().activeQuiz;

        if (activeQuiz?.id !== quizId) return;
        const participant = activeQuiz.quizParticipant.find(p => p.userId === userId)

        if (participant) {
            set({ hasJoined: true, participantName: participant.name });
        }
    },
    setParticipantName: (name: string) => set({ participantName: name }),
    setQuizzes: (quizzes: Quiz[]) => set({quizzes}),
    setActiveQuiz: (quiz) => set({ activeQuiz: quiz }),
    addQuizParticipant: (quizUser: QuizParticipant) =>
        set((state) => ({
            quizParticipants: [...state.quizParticipants, quizUser]
        })),
    addQuiz: (quiz: Quiz) =>
        set((state) => ({
            quizzes: [...state.quizzes, quiz]
        })),
    launchQuiz: (quizId: string) => 
        set((state) => ({
            quizzes: state.quizzes.map((q) => 
                q.id === quizId
                    ? {...q, status: QuizStatus.LAUNCHED}
                    : {...q, status: QuizStatus.LAUNCHED ? QuizStatus.STOPPED : q.status}
            )
        })),
    joinQuiz: (user: QuizParticipant, quizId: string) =>
        set((state) => ({
            quizzes: state.quizzes.map((q) => 
                q.id === quizId 
                    ? {
                        ...q,
                        quizParticipant: q.quizParticipant.some((p) => p.userId === user.userId) 
                            ? q.quizParticipant 
                            : [...q.quizParticipant, user]
                    } : q
            )
        })),
    setCurrentQuestion: (quizId: string, quizQuestionId: string) =>
        set((state) => ({
            quizzes: state.quizzes.map((q) => (
                q.id === quizId ? {...q, currentQuestionId: quizQuestionId} : q
            ))
        })),
    submitAnswer: (quizId: string, userId: string, quizQuestionId: string, quizOptionId: string) => 
        set((state) => ({
            quizzes: state.quizzes.map((q) => {
                if(q.id !== quizId) return q;

                const updatedQuestions = q.quizQuestions.map((qn) => {
                    if(qn.id !== quizQuestionId) return qn;

                    const updatedOptions = qn.quizOptions.map((opt) => {
                        const filteredVotes = opt.quizVotes.filter(vote => vote.userId !== userId)

                        if(opt.id === quizOptionId){
                            return {
                                ...opt,
                                quizVotes: [
                                    ...filteredVotes,
                                    {
                                        userId,
                                        quizQuestionId,
                                        quizOptionId
                                    }
                                ],
                                voteCount: filteredVotes.length + 1
                            }
                        }else{
                            return {
                                ...opt,
                                quizVotes: filteredVotes,
                                voteCount: filteredVotes.length
                            }
                        }
                    })

                    return {
                        ...qn,
                        quizOptions: updatedOptions,
                        voteCount: updatedOptions.reduce((acc, opt) => acc + opt.voteCount, 0)
                    }
                })

                return {
                    ...q,
                    quizQuestions: updatedQuestions
                }
            })
        })),
    revealAnswer: (quizId: string, quizQuestionId: string) =>
        set((state) => ({
            quizzes: state.quizzes.map((q) => {
                if(q.id !== quizId) return q;

                return {
                    ...q,
                    quizQuestions: q.quizQuestions.map((qn) => (
                        qn.id === quizQuestionId ? { ...qn, isAnswerRevealed: true } : qn
                    ))
                }
            })
        })),
    stopQuiz: (quizId: string) =>
        set((state) => ({
            quizzes: state.quizzes.map((q) => (
                q.id === quizId
                    ? {...q, status: QuizStatus.STOPPED}
                    : q
            ))
        })),
    endQuiz: (quizId: string) =>
        set((state) => ({
            quizzes: state.quizzes.map((q) => (
                q.id === quizId
                    ? {...q, status: QuizStatus.ENDED}
                    : q
            ))
        })),
}))

export default useQuizStore;
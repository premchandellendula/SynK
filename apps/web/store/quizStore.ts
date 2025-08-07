import { Quiz, QuizOption, QuizParticipant, QuizQuestion, QuizStore } from "@/types/types";
import { QuizStatus } from "@repo/db";
import { create } from "zustand";

const useQuizStore = create<QuizStore>((set, get) => ({
    quizzes: [],
    activeQuiz: null,
    hasJoined: false,
    participantName: "",
    quizParticipants: [],
    currentQuestion: null,
    setActiveQuestion: (question) => set({ currentQuestion: question }),
    setHasJoined: (hasJoined: boolean) => set({ hasJoined }),
    checkAndRestoreUser: (userId: string, quizId: string) => {
        const activeQuiz = get().activeQuiz;

        if (!activeQuiz || activeQuiz.id !== quizId) return;

        const participantList = activeQuiz.quizParticipant ?? [];
        const participant = participantList.find(p => p.userId === userId);

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
    setCurrentQuestion: (question: QuizQuestion) =>
        set((state) => {
            if (!state.activeQuiz) return state;

            const updatedQuizQuestions = state.activeQuiz.quizQuestions.map((q) =>
                q.id === question.id ? question : q
            );

            return {
                currentQuestion: { ...question },
                activeQuiz: {
                    ...state.activeQuiz,
                    currentQuestion: question,
                    quizQuestions: updatedQuizQuestions,
                }
            };
        }),
    stopQuiz: (quizId: string) =>
        set((state) => ({
            quizzes: state.quizzes.map((q) => (
                q.id === quizId
                    ? {...q, status: QuizStatus.STOPPED}
                    : q
            ))
        })),
    removeQuiz: (quizId: string) =>
        set((state) => ({
            quizzes: state.quizzes.filter((q) => (
                q.id !== quizId
            ))
        })),
    updateQuizOptionVotes: (quizQuestionId: string, quizId: string, quizOptionVotes: QuizOption[]) =>
        set((state): Partial<QuizStore> => {
            const mergeVoteCounts = (options: QuizOption[]) =>
                options.map((option) => {
                    const updated = quizOptionVotes.find((o) => o.id === option.id);
                    return updated ? { ...option, voteCount: updated.voteCount } : option;
                });
            const updatedQuizzes = state.quizzes.map((quiz) =>{
                if (quiz.id !== quizId) return quiz;

                const updatedQuestions = quiz.quizQuestions.map((question) => {
                    if (question.id !== quizQuestionId) return question;

                    return {
                        ...question,
                        quizOptions: mergeVoteCounts(question.quizOptions),
                    };
                })
                return {
                    ...quiz,
                    quizQuestions: updatedQuestions,
                };
            })

            const updatedActiveQuiz = state.activeQuiz?.id === quizId
                    ? {
                        ...state.activeQuiz,
                        quizQuestions: state.activeQuiz.quizQuestions.map((question) => {
                            if (question.id !== quizQuestionId) return question;

                            return {
                                ...question,
                                quizOptions: mergeVoteCounts(question.quizOptions)
                            }
                        })
                    }
                    : state.activeQuiz;
            
            const updatedCurrentQuestion = state.currentQuestion?.id === quizQuestionId
                    ? {
                        ...state.currentQuestion,
                        quizOptions: mergeVoteCounts(state.currentQuestion.quizOptions)
                    }
                    : state.currentQuestion

            return {
                quizzes: updatedQuizzes,
                activeQuiz: updatedActiveQuiz,
                currentQuestion: updatedCurrentQuestion
            };
        }),
}))

export default useQuizStore;
import { Question, QuestionStore } from "@/types/types"
import { QuestionStatus } from "@repo/db";
import { create } from "zustand"

const useQuestionStore = create<QuestionStore>((set) => ({
    questions: [],
    setQuestions: (questions: Question[]) => set({ questions }),
    addQuestion: (question: Question) =>
        set((state) => ({
            questions: [...state.questions, question],
        })),
    toggleVote: (questionId: string, userId: string) => 
        set((state) => ({
            questions: state.questions.map((q) => {
                if(q.id !== questionId) return q;

                const hasVoted = q.upVotes.includes(userId);
                const newVotes = hasVoted
                    ? q.upVotes.filter((id) => id !== userId)
                    : [...q.upVotes, userId]

                return {
                    ...q, upVotes: newVotes
                }
            }),
        })),
    
    updateQuestionStatus: (questionId: string, status: QuestionStatus) => 
        set((state) => ({
            questions: state.questions.map((q) => 
                q.id === questionId ? { ...q, status } : q
            )
        }))
}))

export default useQuestionStore;


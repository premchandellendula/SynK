import { Question, QuestionStore, UpVote } from "@/types/types"
import { QuestionStatus } from "@repo/db";
import { create } from "zustand"

const useQuestionStore = create<QuestionStore>((set) => ({
    questions: [],
    setQuestions: (questions: Question[]) => set({
            questions: questions.map((q) => ({
                ...q,
                upVotes: q.upVotes ?? [],
            })),
        }),
    addQuestion: (question: Question) =>
        set((state) => ({
            questions: [...state.questions, {
                    ...question,
                    upVotes: question.upVotes ?? [],
                },],
        })),
    toggleVote: (questionId: string, userId: string) => 
        set((state) => ({
            questions: state.questions.map((q) => {
                if(q.id !== questionId) return q;
                const upVotes = q.upVotes ?? [];
                const hasVoted = q.upVotes.some((vote) => vote.userId === userId);
                const newVotes = hasVoted
                    ? upVotes.filter((vote) => vote.userId !== userId)
                    : [...upVotes, { userId, questionId }]

                return {
                    ...q, upVotes: newVotes
                }
            }),
        })),
    setQuestionUpVotes: (questionId: string, upVotes: UpVote[]) =>
        set((state) => ({
            questions: state.questions.map((q) =>
                q.id === questionId ? { ...q, upVotes: upVotes ?? [] } : q
            ),
        })),
    updateQuestionStatus: (questionId: string, status: QuestionStatus) => 
        set((state) => ({
            questions: state.questions.map((q) => 
                q.id === questionId ? { ...q, status } : q
            )
        }))
}))

export default useQuestionStore;


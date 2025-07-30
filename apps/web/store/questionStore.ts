import { Question, QuestionStore, UpVote } from "@/types/types"
import { QuestionStatus } from "@repo/db";
import { create } from "zustand"

const useQuestionStore = create<QuestionStore>((set) => ({
    questions: [],
    archiveQuestions: [],
    ignoredQuestions: [],
    questionCount: 0,
    setQuestions: (questions: Question[]) => {
        const mapped = questions.map((q) => ({
            ...q,
            upVotes: q.upVotes ?? [],
        }));
        set({
            questions: mapped,
            questionCount: mapped.length,
        });
    },
    setArchiveQuestions: (archiveQuestions: Question[]) => set({ 
            archiveQuestions: archiveQuestions.map((q) => ({
                ...q,
                upVotes: q.upVotes ?? []
            })) 
        }),
    setIgnoredQuestions: (ignoredQuestions: Question[]) => set({ ignoredQuestions: ignoredQuestions }),
    addQuestion: (question: Question) =>
        set((state) => {
            const exists = state.questions.some((q) => q.id === question.id);
            if (exists) return state;

            const newQuestions = [
                ...state.questions,
                {
                    ...question,
                    upVotes: question.upVotes ?? [],
                },
            ];

            return {
                questions: newQuestions,
                questionCount: newQuestions.length,
            };
        }),
    archiveQuestion: (questionId: string) =>
        set((state) => {
            const questionToArchive = state.questions.find(q => q.id === questionId)
            if(!questionToArchive) return state;

            const newQuestions = state.questions.filter((q) => q.id !== questionId);
            return {
                questions: newQuestions,
                archiveQuestions: [...state.archiveQuestions, questionToArchive],
                questionCount: newQuestions.length,
            }
        }),
    ignoreQuestion: (questionId: string) =>
        set((state) => {
            const questionToIgnore = state.questions.find(q => q.id === questionId)
            if(!questionToIgnore) return state;

            const newQuestions = state.questions.filter((q) => q.id !== questionId);
            return {
                questions: newQuestions,
                ignoredQuestions: [...state.ignoredQuestions, questionToIgnore],
                questionCount: newQuestions.length
            }
        }),
    removeQuestion: (questionId: string) =>
        set((state) => {
            const newQuestions = state.questions.filter((q) => q.id !== questionId);
            return {
                questions: newQuestions,
                questionCount: newQuestions.length,
            };
        }),
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
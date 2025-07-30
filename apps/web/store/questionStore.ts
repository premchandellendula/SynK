import { Question, QuestionStore, UpVote } from "@/types/types"
import { QuestionStatus } from "@repo/db";
import { create } from "zustand"

const useQuestionStore = create<QuestionStore>((set) => ({
    questions: [],
    archiveQuestions: [],
    ignoredQuestions: [],
    setQuestions: (questions: Question[]) => set({
            questions: questions.map((q) => ({
                ...q,
                upVotes: q.upVotes ?? [],
            })),
        }),
    setArchiveQuestions: (archiveQuestions: Question[]) => set({ 
            archiveQuestions: archiveQuestions.map((q) => ({
                ...q,
                upVotes: q.upVotes ?? []
            })) 
        }),
    setIgnoredQuestions: (ignoredQuestions: Question[]) => set({ ignoredQuestions: ignoredQuestions }),
    addQuestion: (question: Question) =>
        set((state) => ({
            questions: [...state.questions, {
                    ...question,
                    upVotes: question.upVotes ?? [],
                },],
        })),
    archiveQuestion: (questionId: string) =>
        set((state) => {
            const questionToArchive = state.questions.find(q => q.id === questionId)
            if(!questionToArchive) return state;
            return {
                questions: state.questions.filter(q => q.id !== questionId),
                archiveQuestions: [...state.archiveQuestions, questionToArchive]
            }
        }),
    ignoreQuestion: (questionId: string) =>
        set((state) => {
            const questionToIgnore = state.questions.find(q => q.id === questionId)
            if(!questionToIgnore) return state;
            return {
                questions: state.questions.filter(q => q.id !== questionId),
                ignoredQuestions: [...state.ignoredQuestions, questionToIgnore]
            }
        }),
    removeQuestion: (questionId: string) =>
        set((state) => {
            return {
                questions: state.questions.filter(q => q.id !== questionId),
            }
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


/*
const useQuestionStore = create((set) => ({
  questions: [],
  archiveQuestions: [],
  ignoredQuestions: [],

  setQuestions: (questions) => set({ questions }),
  setArchiveQuestions: (archiveQs) => set({ archiveQuestions: archiveQs }),
  setIgnoredQuestions: (ignoredQs) => set({ ignoredQuestions: ignoredQs }),

  addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),
  archiveQuestion: (questionId) => set((state) => {
    const questionToArchive = state.questions.find(q => q.id === questionId);
    if (!questionToArchive) return state;

    return {
      questions: state.questions.filter(q => q.id !== questionId),
      archiveQuestions: [...state.archiveQuestions, questionToArchive]
    }
  }),

  // similar for ignoredQuestion, removeQuestion, etc.
}));

*/

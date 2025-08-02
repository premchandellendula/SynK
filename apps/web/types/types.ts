import { PollStatus, QuestionStatus, QuizStatus, RoomStatus } from "@repo/db"

export type User = {
    id: string,
    name: string,
    email: string
}

export type Room = {
    id: string,
    name: string,
    code: string,
    spaceId: string,
    startDate: string,
    status: RoomStatus
    endDate: string,
    createdBy: User,
    questions: Question[],
    polls: Poll[],
    quizzes: Quiz[]
}

export type Question = {
    id: string,
    question: string,
    senderId: string,
    roomId: string,
    upVotes: UpVote[],
    status: QuestionStatus,
    createdAt: string,
    updatedAt: string,
    sender: User
}

export type UpVote = {
    userId: string,
    questionId: string
}

export type Poll = {
    id: string,
    pollQuestion: string,
    createdBy: User,
    roomId: string,
    options: PollOption[],
    pollVotes: PollVote[],
    isLaunched: boolean,
    status: PollStatus
}

export type PollOption = {
    id: string,
    text: string,
    pollId: string,
    voteCount: number
}

export type PollVote = {
    userId: string;
    pollId: string;
    optionId: string;
};

export type Quiz = {
    id: string,
    quizName: string,
    roomId: string,
    creatorId: string,
    status: QuizStatus,
    currentQuestionId:  string,
    currentQuestion: Quiz,
    quizQuestions: QuizQuestion[],
    quizParticipant: QuizParticipant[]
}

export type QuizQuestion = {
    id: string,
    question: string,
    quizId: string,
    voteCount: number,
    quizVotes: QuizVote[],
    isActive: boolean,
    isAnsweredRevealed: boolean,
    timerSeconds: number,
    quizOptions: QuizOption[]
}

export type QuizOption = {
    id: string,
    text: string,
    quizQuestionId: string,
    isCorrect: boolean,
    voteCount: number,
    quizVotes: QuizVote[]
}

export type QuizVote = {
    userId: string;
    quizQuestionId: string;
    quizOptionId: string;
};

export type QuizParticipant = {
    id: string,
    quizId: string,
    userId: string,
    name: string,
    joinedAt: string
}

export type Interaction = "qna" | "poll" | "quiz"

// store

export type QuestionStore = {
    questions: Question[];
    archiveQuestions: Question[];
    ignoredQuestions: Question[];
    questionCount: number,
    setQuestions: (questions: Question[]) => void;
    setArchiveQuestions: (archiveQuestions: Question[]) => void;
    setIgnoredQuestions: (ignoredQuestions: Question[]) => void;
    addQuestion: (question: Question) => void;
    archiveQuestion: (questionId: string) => void;
    ignoreQuestion: (questionId: string) => void;
    removeQuestion: (questionId: string) => void;
    toggleVote: (questionId: string, userId: string) => void;
    setQuestionUpVotes: (questionId: string, upVotes: UpVote[]) => void;
    updateQuestionStatus: (questionId: string, status: QuestionStatus) => void;
};

export type PollStore = {
    polls: Poll[];
    activePoll: Poll | null,
    setPolls: (polls: Poll[]) => void;
    setActivePoll: (poll: Poll | null) => void;
    addPoll: (poll: Poll) => void;
    launchPoll: (pollId: string) => void;
    stopPoll: (pollId: string) => void;
    removePoll: (pollId: string) => void;
    votePoll: (pollId: string, optionId: string, userId: string) => void;
    updateOptionVotes: (pollId: string, updatedOptions: PollOption[]) => void;
}

export type QuizStore = {
    quizzes: Quiz[],
    activeQuiz: Quiz | null,
    hasJoined: boolean,
    participantName: string,
    quizParticipants: QuizParticipant[],
    setQuizzes: (quizzes: Quiz[]) => void,
    checkAndRestoreUser: (userId: string, quizId: string) => void,
    setHasJoined: (hasJoined: boolean) => void,
    setParticipantName: (name: string) => void,
    setActiveQuiz: (quiz: Quiz | null) => void,
    addQuizParticipant: (quizUser: QuizParticipant) => void,
    addQuiz: (quiz: Quiz) => void,
    launchQuiz: (quizId: string) => void,
    joinQuiz: (user: QuizParticipant, quizId: string) => void,
    setCurrentQuestion: (quizId: string, quizQuestionId: string) => void,
    submitAnswer: (quizId: string, userId: string, quizQuestionId: string, quizOptionId: string) => void,
    revealAnswer: (quizId: string, quizQuestionId: string) => void,
    stopQuiz: (quizId: string) => void,
    endQuiz: (quizId: string) => void
}

export type RoomStore = {
    roomId: string,
    name: string,
    spaceId: string,
    code: string
}


// Normal Types

export interface IQuizQuestion {
    question: string,
    options: string[],
    correctOptionIndex: number 
}

export type IQuizBuilderStages = 'build' | 'waiting' | 'question' | 'leaderboard'
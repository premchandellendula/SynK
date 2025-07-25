type User = {
    id: string,
    name: string
}

type Poll = {
    id: string,
    pollQuestion: string,
    options: string[],
    pollVotes: number
}

type Quiz = {
    id: string,
    quizName: string,
    upVotes: string,
    sender: User,
    pollVotes: number
}

type Question = {
    id: string,
    question: string,
    pollQuestion: string,
    options: string[],
    pollVotes: number
}

export type Room = {
    id: string,
    name: string,
    code: string,
    spaceId: string,
    startDate: string,
    endDate: string,
    createdBy: User,
    questions: Question[],
    polls: Poll[],
    quizzes: Quiz[]
}

export type Interaction = "qna" | "poll" | "quiz"
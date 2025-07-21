import { prisma, QuizStatus } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function quizHandler(io: Server, socket: Socket){
    socket.on("start-quiz", (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }

        const { quizId, roomId, userId } = data;

        io.to(roomId).emit("quiz-started", {
            message: "start quiz"
        })
        socket.emit("joined-quiz", { quizId })
    })

    socket.on("join-room", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }

        const { roomId, userId, quizId, name } = data;

        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })

            if(!room){
                throw new Error("Room not found")
            }
            
            if (room.endDate < new Date() || room.status === "ENDED") {
                throw new Error("Room has already ended. Cannot create quiz.")
            }

            const quiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId
                }
            })

            if(!quiz){
                throw new Error("Quiz not found")
            }
            let quizUser = await prisma.quizParticipant.findUnique({
                where: {
                    quizId_userId: { quizId, userId }
                }
            })

            if (!quizUser) {
                quizUser = await prisma.quizParticipant.create({
                    data: { quizId, userId, name }
                })
            }

            socket.join(quizId)
            io.to(quizId).emit("user-joined", {
                id: quizUser.id,
                name: quizUser.name
            })
        }catch(err) {
            console.log("Error joining the quiz: ", err);
            socket.emit("quiz-joining-error", { message: "Could not join the quiz. Try again." });
        }
    })
    socket.on("launch-quiz", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }

        const { quizId, roomId, quizQuestionId, userId } = data;

        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })

            if(!room){
                throw new Error("Room not found")
            }
            
            if (room.endDate < new Date() || room.status === "ENDED") {
                throw new Error("Room has already ended. Cannot create quiz.")
            }

            if(room.creatorId !== userId){
                    throw new Error("Only room owners can launch the question in a quiz")
            }

            const quiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId
                }
            })

            if(!quiz){
                throw new Error("Quiz not found")                
            }

            if (quiz.status !== "LAUNCHED") {
                    throw new Error("Quiz is not running. Cannot activate questions.")
            }
            const existingQuestion = await prisma.quizQuestion.findUnique({
                where: { id: quizQuestionId }
            });

            if (!existingQuestion || existingQuestion.quizId !== quizId) {
                throw new Error("Question does not belong to this quiz.")
            }
            await prisma.$transaction([
                prisma.quizQuestion.updateMany({
                    where: {
                        quizId,
                        isActive: true
                    },
                        data: {
                        isActive: false
                    }
                }),
                prisma.quiz.update({
                    where: {
                        id: quizId
                    },
                    data: {
                        currentQuestionId: quizQuestionId
                    }
                }),
                prisma.quizQuestion.update({
                    where: {
                        id: quizQuestionId
                    },
                    data: {
                        isActive: true
                    }
                })
            ]);

            const question = await prisma.quizQuestion.findUnique({
                where: {
                    id: quizQuestionId
                },
                select: {
                    id: true,
                    question: true,
                    voteCount: true,
                    quizOptions: {
                        select: {
                            id: true,
                            text: true,
                            voteCount: true
                        }
                    },
                    timerSeconds: true
                }
            })
            
            io.to(roomId).emit("quiz-question", {
                question
            })
        }catch(err) {
            console.log("Error starting the quiz: ", err);
            socket.emit("quiz-start-error", { message: "Could not start quiz. Try again." });
        }
    })

    socket.on("quiz-answer", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }

        const { quizId, quizQuestionId, userId, quizOptionId, roomId } = data;

        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })

            if(!room){
                throw new Error("Room not found")
            }
            
            if (room.endDate < new Date() || room.status === "ENDED") {
                throw new Error("Room has already ended. Cannot create quiz.")
            }

            const quiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId
                }
            })

            if(!quiz){
                throw new Error("Quiz not found")
            }

            if (quiz.status !== QuizStatus.LAUNCHED) {
                throw new Error("Quiz is not currently running.")
            }

            const question = await prisma.quizQuestion.findUnique({
                where: {
                    id: quizQuestionId,
                    quizId
                }
            });

            if (!question || !question.isActive) {
                throw new Error("Question is not active. Cannot vote.")
            }

            const existingVote = await prisma.quizVote.findUnique({
                where: {
                    userId_quizQuestionId: {
                        userId: userId,
                        quizQuestionId: quizQuestionId
                    }
                }
            });

            if (existingVote) {
                throw new Error("You have already voted for this question.")
            }

            await prisma.$transaction(async (tx) => {
                const option = await tx.quizOption.findUnique({
                    where: { id: quizOptionId},
                    select: {
                        isCorrect: true,
                        quizQuestionId: true,
                        quizQuestion: {
                            select: {
                                quizId: true
                            }
                        }
                    }
                })

                if (!option) throw new Error("Invalid quiz option");

                const quizId = option.quizQuestion.quizId;

                await tx.quizVote.create({
                    data: {
                        quizOptionId,
                        userId: userId,
                        quizQuestionId: quizQuestionId
                    }
                });

                if (option.isCorrect) {
                    await tx.quizLeaderBoard.upsert({
                        where: {
                            quizId_userId: {
                                userId: userId,
                                quizId: quizId
                            }
                        },
                        create: {
                            userId: userId,
                            quizId: quizId,
                            score: 1
                        },
                        update: {
                            score: { increment: 1 }
                        }
                    });
                }
            })
        }catch(err) {
            console.log("Error choosing the quiz option: ", err);
            socket.emit("quiz-vote-error", { message: "Could not vote quiz. Try again." });
        }
    })

    socket.on("reveal-answer", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }

        const { quizId, quizQuestionId, userId, roomId } = data;

        try {
            const room = await prisma.room.findUnique({ where: { id: roomId } });
            if (!room) {
                throw new Error("Room not found")
            }

            if (room.endDate < new Date() || room.status === "ENDED") {
                throw new Error("Room has already ended.")
            }

            if(room.creatorId !== userId){
                throw new Error("Only owners can reveal the answers")
            }

            const quiz = await prisma.quiz.findUnique({ 
                where: { id: quizId },
                include: {
                    quizQuestions: {
                        orderBy: { createdAt: 'asc' },
                    }
                }
            });
            if (!quiz) {
                throw new Error("Quiz not found")
            }

            if (quiz.status !== "LAUNCHED") {
                throw new Error("Quiz is not active.")
            }
            if (quiz.currentQuestionId !== quizQuestionId) {
                throw new Error("You can only reveal the currently active question.");
            }

            const currentQuestionIndex = quiz.quizQuestions.findIndex(
                q => q.id === quiz.currentQuestionId
            );
            const isLastQuestion = currentQuestionIndex === quiz.quizQuestions.length - 1;

            const questionForReveal = await prisma.quizQuestion.findUnique({
                where: { id: quizQuestionId },
                include: {
                    quizOptions: {
                        select: {
                            id: true,
                            text: true,
                            voteCount: true,
                            isCorrect: true
                        }
                    }
                }
            });

            if (!questionForReveal || questionForReveal.quizId !== quizId) {
                throw new Error("Invalid question.")
            }

            await prisma.quizQuestion.update({
                where: { id: quizQuestionId },
                data: { isAnswerRevealed: true }
            });

            const { id, question, quizOptions } = questionForReveal;
            io.to(roomId).emit("answer-revealed", {
                questionId: id,
                question,
                options: quizOptions.map(opt => ({
                    id: opt.id,
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    voteCount: opt.voteCount
                }))
            })

            if (isLastQuestion) {
                await prisma.quiz.update({
                    where: { id: quizId },
                    data: { status: QuizStatus.STOPPED, currentQuestionId: null }
                });

                io.to(quiz.roomId).emit("quiz-complete", {
                    quizId: quiz.id,
                    message: "The quiz is over.",
                    endedAt: new Date()
                });
            }
        }catch(err) {
            console.log("Error revealing the quiz answer: ", err);
            socket.emit("quiz-reveal-error", { message: "Could not reveal answer. Try again." });
        }
    })

    socket.on("reveal-leaderboard", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }

        const { quizId, roomId, userId } = data;
        try {
            const room = await prisma.room.findUnique({
                where: {
                    id: roomId
                }
            })

            if(!room){
                throw new Error("Room not found")
            }
            
            if (room.endDate < new Date()) {
                throw new Error("Room has already ended. Cannot create quiz.")
            }

            if (room.creatorId !== userId) {
                throw new Error("Only the quiz owner can reveal the leaderboard.");
            }

            const quiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId
                }
            })

            if(!quiz){
                throw new Error("Quiz not found")
            }

            const leaderboard = await prisma.quizLeaderBoard.findMany({
                where: {
                    quizId: quizId
                },
                select: {
                    quiz: {
                        select: {
                            quizName: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    score: true
                },
                orderBy: {
                    score: 'desc'
                }
            })
            if (!leaderboard || leaderboard.length === 0) {
                socket.emit("leaderboard-reveal-error", {
                    message: "Leaderboard is empty or not yet calculated."
                });
                return;
            }
            const quizName = leaderboard[0]?.quiz.quizName ?? "Untitled Quiz"
            io.to(roomId).emit("leaderboard-revealed", {
                quizId,
                quizName,
                leaderboard: leaderboard.map((entry, idx) => ({
                    rank: idx + 1,
                    userId: entry.user.id,
                    name: entry.user.name,
                    score: entry.score
                }))
            })
        }catch(err) {
            console.log("Error revealing the quiz leaderboard: ", err);
            socket.emit("leaderboard-reveal-error", { message: "Could not reveal leaderboard. Try again." });
        }
    })
}
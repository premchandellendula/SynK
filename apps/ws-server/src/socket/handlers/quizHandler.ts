import { prisma, QuizStatus } from "@repo/db";
import { Server, Socket } from "socket.io";

export default function quizHandler(io: Server, socket: Socket){
    socket.on("start-quiz", (data) => {
        const { quizId, roomId, quiz, userId } = data;

        // console.log(quiz)
        io.to(roomId).emit("quiz-started", {
            message: "start quiz",
            quiz
        })
        // socket.emit("joined-quiz", { quizId })
    })

    socket.on("join-quiz", async (data) => {
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

            io.to(roomId).emit("user-joined", {
                quizUser
            })
        }catch(err) {
            console.log("Error joining the quiz: ", err);
            socket.emit("quiz-joining-error", { message: "Could not join the quiz. Try again." });
        }
    })
    socket.on("set-current-question", async (data) => {
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
                        id: quizId,
                        roomId
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
                include: {
                    quizVotes: true,
                    quizOptions: {
                        include: {
                            quizVotes: true,
                            quizQuestion: true
                        }
                    }
                }
            })
            const quizZ = await prisma.quiz.findUnique({
                where: {
                    id: quizId
                },
                include: {
                    currentQuestion: {
                        include: {
                            quizOptions: {
                                include: {
                                    quizVotes: true
                                }
                            },
                            quizVotes: true
                        }
                    },
                    quizQuestions: {
                        include: {
                            quizOptions: {
                                include: {
                                    quizVotes: true
                                }
                            },
                            quizVotes: true
                        }
                    }
                }
            })
            // console.log(question)
            // console.log(quizZ)
            io.to(roomId).emit("current-question-set", {
                question,
                quiz: quizZ
            })
        }catch(err) {
            console.log("Error starting the quiz: ", err);
            socket.emit("quiz-start-error", { message: "Could not start quiz. Try again." });
        }
    })

    socket.on("quiz-answer", async (data) => {
        const { quizId, quizQuestionId, userId, quizOptionId, roomId } = data;
        // console.log(data)
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
                    where: { id: quizOptionId },
                    select: {
                        isCorrect: true,
                        quizQuestionId: true,
                        quizQuestion: {
                            select: {
                                quizId: true,
                            },
                        },
                    },
                });

                if (!option) throw new Error("Invalid quiz option");

                await tx.quizVote.create({
                    data: {
                        quizOptionId,
                        userId,
                        quizQuestionId,
                    },
                });

                await tx.quizOption.update({
                    where: { id: quizOptionId },
                    data: {
                        voteCount: {
                            increment: 1,
                        },
                    },
                });

                const leaderboardWhere = {
                    quizId_userId: {
                        quizId: option.quizQuestion.quizId,
                        userId,
                    },
                };

                if (option.isCorrect) {
                    await tx.quizLeaderBoard.upsert({
                        where: leaderboardWhere,
                        create: {
                            quizId: option.quizQuestion.quizId,
                            userId,
                            score: 1,
                        },
                        update: {
                                score: {increment: 1},
                            },
                    });
                }else{
                    const existing = await tx.quizLeaderBoard.findUnique({
                        where: leaderboardWhere
                    })

                    if(!existing){
                        await tx.quizLeaderBoard.create({
                            data: {
                                quizId: option.quizQuestion.quizId,
                                userId,
                                score: 0,
                            },
                        })
                    }
                }
            })
            
            const updatedOptions = await prisma.quizOption.findMany({
                where: { quizQuestionId },
                select: {
                    id: true,
                    text: true,
                    voteCount: true,
                    isCorrect: true,
                },
            });

            console.log(updatedOptions)

            io.to(roomId).emit("answered-quiz-question", {
                quizQuestionId,
                quizId,
                quizOptionVotes: updatedOptions
            })
        }catch(err) {
            console.log("Error choosing the quiz option: ", err);
            socket.emit("quiz-vote-error", { message: "Could not vote quiz. Try again." });
        }
    })

    socket.on("reveal-answer", async (data) => {
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
                        orderBy: { order: 'asc' },
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
                where: { id: quizQuestionId }
            });

            if (!questionForReveal || questionForReveal.quizId !== quizId) {
                throw new Error("Invalid question.")
            }

            await prisma.quizQuestion.update({
                where: { id: quizQuestionId },
                data: { isAnswerRevealed: true }
            });

            const question = await prisma.quizQuestion.findUnique({
                where: {id: quizQuestionId},
                include: {
                    quizOptions: {
                        include: {
                            quizVotes: true
                        }
                    },
                    quizVotes: true
                }
            })
            console.log("question- revealed: ", question)
            
            const correctOptionId = question?.quizOptions.find((option) => option.isCorrect === true)
            // console.log("option revealed: ", correctOptionId)
            io.to(roomId).emit("answer-revealed", {
                question,
                correctOptionId
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
        const { quizId, roomId, userId } = data;
        console.log("data: ", data)
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

            // const leaderboard = await prisma.quizLeaderBoard.findMany({
            //     where: {
            //         quizId: quizId
            //     },
            //     select: {
            //         quiz: {
            //             select: {
            //                 quizName: true
            //             }
            //         },
            //         user: {
            //             select: {
            //                 id: true,
            //                 name: true
            //             }
            //         },
            //         score: true
            //     },
            //     orderBy: {
            //         score: 'desc'
            //     }
            // })
            // if (!leaderboard || leaderboard.length === 0) {
            //     socket.emit("leaderboard-reveal-error", {
            //         message: "Leaderboard is empty or not yet calculated."
            //     });
            //     return;
            // }
            // console.log(leaderboard);
            // const quizName = leaderboard[0]?.quiz.quizName ?? "Untitled Quiz"
            // io.to(roomId).emit("leaderboard-revealed", {
            //     quizId,
            //     quizName,
            //     leaderboard: leaderboard.map((entry, idx) => ({
            //         rank: idx + 1,
            //         userId: entry.user.id,
            //         name: entry.user.name,
            //         score: entry.score
            //     }))
            // })

            io.to(roomId).emit("leaderboard-revealed", {
                quizId,
                roomId,
                userId
            })
        }catch(err) {
            console.log("Error revealing the quiz leaderboard: ", err);
            socket.emit("leaderboard-reveal-error", { message: "Could not reveal leaderboard. Try again." });
        }
    })

    socket.on("end-quiz", async (data) => {
        const {quizId, roomId, userId} = data;

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
                throw new Error("Room has expired.")
            }

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can create or launch polls.")
            }

            const existingQuiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId,
                    roomId
                }
            })

            if(!existingQuiz){
                throw new Error("Quiz not found")
            }

            const quiz = await prisma.quiz.update({
                where: {
                    id: quizId,
                    roomId
                },
                data: {
                    status: QuizStatus.DRAFT
                }
            })

            io.to(roomId).emit("quiz-ended", {
                quiz
            })
        } catch(err) {
            console.error("Error ending a  poll:", err);
            socket.emit("ending-quiz-error", { message: "Could not end a quiz. Try again." });
        }
    })

    socket.on("remove-quiz", async (data) => {
        const {quizId, roomId, userId} = data;

        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId }
            })

            if(!room){throw new Error("Room not found")}

            if (room.endDate < new Date() || room.status === "ENDED") {
                    throw new Error("Room has expired.")
            }

            if(room.creatorId !== userId){
                throw new Error("Only the room owner can create or launch polls.")
            }

            const existingQuiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId,
                    roomId
                }
            })

            if(!existingQuiz){
                throw new Error("Quiz not found")
            }
            const quiz = await prisma.quiz.delete({
                where: {
                    id: quizId,
                    roomId
                }
            })

            io.to(roomId).emit("quiz-removed", {
                quiz
            })
        } catch(err) {
            console.error("Error deleting a quiz:", err);
            socket.emit("deleting-quiz-error", { message: "Could not delete a quiz. Try again." });
        }
    })
}
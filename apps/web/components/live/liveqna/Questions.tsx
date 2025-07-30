"use client";
import QuestionCard from '@/components/cards/QuestionCard'
import { useSocket } from '@/hooks/useSocket';
import { useUser } from '@/hooks/useUser';
import useQuestionStore from '@/store/questionStore'
import useRoomStore from '@/store/roomStore';
import axios from 'axios';
import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react';
import { Question } from '@/types/types';

const Questions = () => {
    const questions = useQuestionStore((state) => state.questions)
    // console.log(questions);
    const addQuestion = useQuestionStore((state) => state.addQuestion);
    const setQuestions = useQuestionStore((state) => state.setQuestions);
    const setArchiveQuestions = useQuestionStore((state) => state.setArchiveQuestions);
    const setIgnoredQuestions = useQuestionStore((state) => state.setIgnoredQuestions);
    const socket = useSocket();
    const roomId = useRoomStore((s) => s.room?.roomId);
    const room = useRoomStore((s) => s.room);
    const { user } = useUser();

    useEffect(() => {
        if (!socket || !roomId || !user?.id) return;

        const handleConnect = () => {
            // console.log("Socket connected, emitting join-room:", { roomId, userId: user.id });
            socket.emit("join-room", { roomId, userId: user.id });
        };

        socket.on("connect", handleConnect);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
        };
    }, [socket, socket.connected, roomId, user?.id]);


    useEffect(() => {
        const fetchQuestions = async () => {
            if(!roomId) return;
            try {
                const response = await axios.get(`/api/room/${roomId}/questions`, {
                    withCredentials: true,
                });
                setQuestions(response.data.questions || []);
            } catch (err) {
                console.error("Failed to fetch questions", err);
            }
        }
        fetchQuestions();
    }, [roomId, setQuestions])
    // console.log("Socket status:", socket?.connected, socket);

    useEffect(() => {
        const handleQStatusUpdate = ({questions, archiveQuestions, ignoredQuestions}: {questions: Question[], archiveQuestions: Question[], ignoredQuestions: Question[]}) => {
            setQuestions(questions)
            setArchiveQuestions(archiveQuestions)
            setIgnoredQuestions(ignoredQuestions)
        };
        
        socket.on("question-status-changed", handleQStatusUpdate);
        
        return () => {
            socket.off("question-status-changed", handleQStatusUpdate);
        };
    }, [socket, setQuestions, setArchiveQuestions, setIgnoredQuestions]);

    useEffect(() => {
        if(!roomId || !socket) return;
        const handleNewQuestion = (data: any) => {
            // console.log('Received new question:', data);
            // alert("hi")

            if (data.userId !== user?.id) {
                addQuestion(data.question);
            }
        };
        socket.on("new question", (handleNewQuestion));

        return () => {
            socket.off("new question", handleNewQuestion);
        };

    }, [socket, roomId, user?.id, addQuestion, questions]);

    if (!room) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500">Loading chat...</p>
                </div>
            </div>
        );
    }
    
    return (
        <motion.div layout>
            <AnimatePresence>
                {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
            </AnimatePresence>
        </motion.div>
    )
}

export default Questions
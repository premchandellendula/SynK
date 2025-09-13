"use client";
import { useSocket } from '@/hooks/useSocket';
import { useUser } from '@/hooks/useUser';
import useQuestionStore from '@/store/questionStore'
import useRoomStore from '@/store/roomStore';
import axios from 'axios';
import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react';
import QuestionOnAdminPanel from '../cards/QuestionOnAdminPanel';

const AdminQuestions = () => {
    const questions = useQuestionStore((state) => state.questions)
    const addQuestion = useQuestionStore((state) => state.addQuestion);
    const setQuestions = useQuestionStore((state) => state.setQuestions);
    const socket = useSocket();
    const roomId = useRoomStore((s) => s.room?.roomId);
    const room = useRoomStore((s) => s.room);
    const { user } = useUser();
    const hasJoined = useRef(false);

    useEffect(() => {
        if (!socket || !roomId || !user?.id || hasJoined.current) return;

        const handleConnect = () => {
            socket.emit("join-room", { roomId, userId: user.id });
            hasJoined.current = true;
        };

        if (socket.connected) {
            handleConnect();
        } else {
            socket.on("connect", handleConnect);
        }

        return () => {
            socket.off("connect", handleConnect);
        };
    }, [socket, roomId, user?.id]);


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
        if(!roomId || !socket) return;
        const handleNewQuestion = (data: any) => {

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
                {questions.map((q) => <QuestionOnAdminPanel key={q.id} question={q} />)}
            </AnimatePresence>
        </motion.div>
    )
}

export default AdminQuestions
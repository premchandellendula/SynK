import React, { useEffect } from 'react'
import QuestionInput from './QuestionInput'
import Questions from './Questions'
import { useSocket } from '@/hooks/useSocket';
import usePollStore from '@/store/pollStore';
import { Interaction, Poll, Quiz } from '@/types/types';
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket';
import useRoomStore from '@/store/roomStore';
import { useUser } from '@/hooks/useUser';
import useQuizStore from '@/store/quizStore';

const UserQuestionBox = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const socket = useSocket();
    const { setActivePoll } = usePollStore();
    const { setActiveQuiz } = useQuizStore();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();

    useJoinRoomSocket({ socket, roomId, userId: user?.id })

    useEffect(() => {
        
    }, [])

    useEffect(() => {
        if (!socket) return;

        const handleLaunchNewPoll = (data: { poll: Poll }) => {
            console.log("📢 User received new-poll-launched:", data);
            const { poll } = data;
            setActivePoll(poll);
            setInteraction("poll")
        };

        const attachListener = () => {
            socket.on("new-poll-launched", handleLaunchNewPoll);
        };

        if (socket.connected) {
            // console.log("hi")
            attachListener();
        }

        socket.on("connect", attachListener);

        return () => {
            socket.off("new-poll-launched", handleLaunchNewPoll);
            socket.off("connect", attachListener);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleLaunchExistingPoll = (data: { poll: Poll}) => {
            console.log("🚀 Received existing-poll-launched:", data);
            const { poll } = data;
            setActivePoll(poll);
            setInteraction("poll")
        };

        const handleQuizStarted = (data: { quiz: Quiz}) => {
            console.log("🚀 Received quiz-started:", data);
            const { quiz } = data;
            setActiveQuiz(quiz)
            setInteraction("quiz")
        };

        const attachListener = () => {
            socket.on("existing-poll-launched", handleLaunchExistingPoll);
            socket.on("quiz-started", handleQuizStarted);
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);

        return () => {
            socket.off("existing-poll-launched", handleLaunchExistingPoll);
            socket.off("quiz-started", handleQuizStarted);
            socket.off("connect", attachListener);
        };
    }, [socket]);
    
    return (
        <div>
            <QuestionInput />
            <Questions />
        </div>
    )
}

export default UserQuestionBox
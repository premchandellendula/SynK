import useQuizStore from '@/store/quizStore'
import React, { useEffect } from 'react'
import { Button } from '../ui/button';
import { IQuizBuilderStages, QuizParticipant } from '@/types/types';
import { useSocket } from '@/hooks/useSocket';
import useRoomStore from '@/store/roomStore';
import { useUser } from '@/hooks/useUser';
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket';
import { timeAgo } from '@/lib/utils';

const WaitingLobby = ({setStep}: {setStep: (step: IQuizBuilderStages) => void}) => {
    const { quizParticipants, addQuizParticipant } = useQuizStore();
    const socket = useSocket();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const { user } = useUser();

    useJoinRoomSocket({socket, roomId, userId: user?.id})

    useEffect(() => {
        if (!socket || !roomId) return;

        const handleUserJoined = (data: { quizUser: QuizParticipant}) => {
            console.log("🚀 Received user-joined:", data);
            const { quizUser } = data;
            addQuizParticipant(quizUser);
        };

        const attachListener = () => {
            socket.on("user-joined", handleUserJoined);
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);

        return () => {
            socket.off("user-joined", handleUserJoined);
            socket.off("connect", attachListener);
        };
    }, [socket, roomId, quizParticipants]);

    return (
        <div>
            <div className='absolute top-12 bottom-12 left-0 right-0 overflow-y-auto p-2'>
                <h2 className="text-xl font-semibold mb-2">Waiting for players...</h2>
                <ul className="grid grid-cols-2 space-y-2">
                    {quizParticipants.map((p) => (
                        <li
                            key={p.id}
                            className="flex items-center justify-between bg-muted/40 border border-border p-2 rounded-sm transition hover:bg-muted/50"
                        >
                            <div className="text-base font-medium text-foreground">{p.name}</div>
                            <sub className="text-xs text-muted-foreground whitespace-nowrap">
                                Joined {timeAgo(p.joinedAt)}
                            </sub>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-input/20 flex items-center px-2">
                <Button>
                    First Question
                </Button>
            </div>
        </div>
    )
}

export default WaitingLobby
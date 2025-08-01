import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface UseJoinRoomSocketProps {
    socket: Socket | null;
    roomId: string | undefined;
    userId: string | undefined;
}

export function useJoinRoomSocket({ socket, roomId, userId }: UseJoinRoomSocketProps) {
    useEffect(() => {
        if (!socket || !roomId || !userId) return;

        const joinRoom = () => {
            console.log("🔌 Socket connected, emitting join-room:", { roomId, userId });
            socket.emit("join-room", { roomId, userId });
        };

        socket.on("connect", joinRoom);

        if (socket.connected) {
            joinRoom();
        }

        return () => {
            socket.off("connect", joinRoom);
        };
    }, [socket, roomId, userId]);
}

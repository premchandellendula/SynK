import { io, Socket } from "socket.io-client";
import { useRef } from "react";

let socket: Socket | null = null;

export const useSocket = (): Socket => {
    const socketRef = useRef<Socket | null>(null);

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            withCredentials: true,
            autoConnect: false
        });
    }

    if (!socket.connected) {
        socket.connect();
    }

    socketRef.current = socket;

    return socketRef.current;
}
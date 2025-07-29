import { getSocket } from "@/lib/socket";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export const useSocket = (): Socket => {
    const [socket, setSocket] = useState(() => getSocket());

    useEffect(() => {
        if (!socket.connected) socket.connect();
        return () => {
            socket.disconnect(); 
        };
    }, [socket]);

    return socket;
}
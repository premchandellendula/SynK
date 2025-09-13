import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    // console.log(process.env.NEXT_PUBLIC_SOCKET_URL!)
    if (typeof window === 'undefined') {
        throw new Error("Socket can only be used in the browser");
    }

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            withCredentials: true,
            autoConnect: false,
        });
    }

    if (!socket.connected && socket.disconnected) {
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
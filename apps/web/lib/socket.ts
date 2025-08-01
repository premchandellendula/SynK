import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    // console.log(process.env.NEXT_PUBLIC_SOCKET_URL!)
    if(!socket){
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            withCredentials: true
        })
    }

    if (!socket.connected) {
        socket.connect();
    }
    return socket;
}
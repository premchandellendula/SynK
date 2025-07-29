import { Server, Socket } from "socket.io";

export default function joinRoomHandler(io: Server, socket: Socket){
    socket.on("join-room", async (data) => {
        // console.log(data);
        // console.log(data.roomId); 
        const { roomId, userId } = data;
        if (!roomId || !userId) {
            console.warn(`Invalid join-room data`, data);
            return;
        }
        // console.log("start")

        socket.join(roomId)
        console.log(`User ${userId} joined room ${roomId}`)
        socket.emit("joined-room", { roomId });
    })
}
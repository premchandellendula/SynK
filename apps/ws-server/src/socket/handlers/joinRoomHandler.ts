import { Server, Socket } from "socket.io";

export default function joinRoomHandler(io: Server, socket: Socket){
    socket.on("join-room", async (data) => {
        // for postman testing
        // remove-start
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }
        console.log(data);
        console.log(data.roomId); 
        // remove-end

        const { roomId, userId } = data;
        // console.log("start")

        socket.join(roomId)
        console.log(`User ${userId} joined room ${roomId}`)
        socket.emit("joined-room", { roomId })
    })
}
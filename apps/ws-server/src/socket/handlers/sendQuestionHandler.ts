import { Server, Socket } from "socket.io";

export default function sendQuestionHandler(io: Server, socket: Socket){
    socket.on("send-question", async (data) => {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Invalid JSON string received:", data);
                return;
            }
        }
        console.log(data);
        const { roomId, question, sender } = data;

        socket.to(roomId).emit("new question", {
            roomId,
            question,
            userId: sender.id
        })
    })
}
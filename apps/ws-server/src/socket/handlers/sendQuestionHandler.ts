import { Server, Socket } from "socket.io";

export default function sendQuestionHandler(io: Server, socket: Socket){
    socket.on("send-question", async (data) => {
        // console.log(data);
        const { roomId, question, sender } = data;
        // console.log(question)
        // console.log(roomId)
        io.to(roomId).emit("new question", {
            roomId,
            question,
            userId: sender.id
        })
    })
}
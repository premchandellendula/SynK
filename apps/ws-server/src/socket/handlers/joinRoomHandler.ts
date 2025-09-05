import { Server, Socket } from "socket.io";
import { addUserToRoom, isUserInRoom, removeUserFromRoom } from "../store/roomStore";
import { removeUserFromRoomDB } from "../utils/db/roomMember";

export default function joinRoomHandler(io: Server, socket: Socket){
    socket.on("join-room", async (data) => {
        // console.log(data);
        // console.log(data.roomId); 
        const { roomId, userId } = data;
        if (!roomId || !userId) {
            console.warn(`Invalid join-room data`, data);
            return;
        }

        if (isUserInRoom(roomId, userId)) {
            console.warn(`User ${userId} already in room ${roomId}`);
            socket.emit("join-error", { message: "Already joined" });
            return;
        }

        socket.join(roomId)
        addUserToRoom(roomId, userId, socket.id);
        console.log(`User ${userId} joined room ${roomId}`)
        socket.emit("joined-room", { roomId });
    })

    socket.on("leave-room", async ({ roomId, userId }) => {
        socket.leave(roomId);
        removeUserFromRoom(roomId, userId);
        await removeUserFromRoomDB(userId, roomId);
        console.log(`User ${userId} left room ${roomId}`);
    });
}
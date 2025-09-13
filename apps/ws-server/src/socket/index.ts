import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from "http";
import { authUser } from './utils/auth';
import joinRoomHandler from './handlers/joinRoomHandler';
import sendQuestionHandler from './handlers/sendQuestionHandler';
import registerQuestionVoteHandler from './handlers/registerQuestionVoteHandler';
import registerPollVoteHandler from './handlers/registerPollVoteHandler';
import changeQuestionStatusHandler from './handlers/changeQuestionStatusHandler';
import quizHandler from './handlers/quizHandler';
import * as cookie from 'cookie'
import pollHandler from './handlers/pollHandler';
import { removeUserBySocketId } from './store/roomStore';
import { removeUserFromRoomDB } from './utils/db/roomMember';

export async function initializeSocket(server: Server, allowedOrigins: string[]){
    const io = new SocketIOServer(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
            console.error("No cookies sent");
            socket.disconnect();
            return;
        }

        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies["token"];
        if (!token) {
            console.error("Token not found in cookies");
            socket.disconnect();
            return;
        }
        const userId = authUser(token);
        if (!userId) {
            socket.disconnect();
            return;
        }

        // handlers
        joinRoomHandler(io, socket);
        sendQuestionHandler(io, socket);
        registerQuestionVoteHandler(io, socket);
        changeQuestionStatusHandler(io, socket);
        pollHandler(io, socket);
        registerPollVoteHandler(io, socket);
        quizHandler(io, socket);

        // socket.on('disconnect', async () => {
        //     const removed = removeUserBySocketId(socket.id);
        //     if (removed) {
        //         const { userId, roomId } = removed;
        //         await removeUserFromRoomDB(userId, roomId);
        //         console.log(`User ${removed.userId} disconnected from room ${removed.roomId}`);
        //     } else {
        //         console.log(`Client disconnected: ${socket.id}`);
        //     }
        // });
    });

    return io;
}
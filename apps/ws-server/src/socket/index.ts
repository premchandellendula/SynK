import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from "http";
import { authUser } from './utils/auth';
import joinRoomHandler from './handlers/joinRoomHandler';
import sendQuestionHandler from './handlers/sendQuestionHandler';
import registerQuestionVoteHandler from './handlers/registerQuestionVoteHandler';
import registerPollVoteHandler from './handlers/registerPollVoteHandler';
import changeQuestionStatusHandler from './handlers/changeQuestionStatusHandler';
import quizHandler from './handlers/quizHandler';

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
        const token: string | string[] | undefined = socket.handshake.query.token;

        let actualToken: string | undefined;

        if (token === undefined) {
            console.error("No token provided");
            actualToken = undefined;
        } else if (Array.isArray(token)) {
            console.log(token[0]);
            actualToken = token[0];
        } else {
            console.log(token);
            actualToken = token;
        }

        let userId;
        if (actualToken) {
            userId = authUser(actualToken);
            console.log(userId);
        } else {
            console.error("Token is missing or invalid");
        }

        if(!userId){
            socket.disconnect()
            return;
        }

        // handlers
        joinRoomHandler(io, socket);
        sendQuestionHandler(io, socket);
        registerQuestionVoteHandler(io, socket);
        changeQuestionStatusHandler(io, socket);
        registerPollVoteHandler(io, socket);
        quizHandler(io, socket);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}
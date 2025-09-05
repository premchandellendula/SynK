type RoomUsers = {
    [roomId: string] : {
        [userId: string] : {
            socketId: string
        }
    }
}

const roomUsers: RoomUsers = {};

export function addUserToRoom(roomId: string, userId: string, socketId: string){
    if(!roomUsers[roomId]){
        roomUsers[roomId] = {}
    }

    roomUsers[roomId][userId] = { socketId };
}

export function removeUserFromRoom(roomId: string, userId: string){
    if(roomUsers[roomId]){
        delete roomUsers[roomId][userId];
        if (Object.keys(roomUsers[roomId]).length === 0) {
            delete roomUsers[roomId];
        }
    }
}

export function removeUserBySocketId(socketId: string){
    for(const roomId in roomUsers){
        for(const userId in roomUsers[roomId]){
            if(roomUsers[roomId][userId]?.socketId === socketId){
                removeUserFromRoom(roomId, userId);
                return { roomId, userId };
            }
        }
    }

    return null;
}

export function isUserInRoom(roomId: string, userId: string) {
    return !!roomUsers[roomId]?.[userId];
}
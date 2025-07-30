import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware'

type RoomInfo = {
    roomId: string;
    code: string;
    name: string;
    spaceId: string;
};

type RoomStore = {
    room: RoomInfo | null;
    setRoom: (room: RoomInfo) => void;
    clearRoom: () => void;
};

const useRoomStore = create<RoomStore>()(
    persist(
        (set) => ({
            room: null,
            setRoom: (room) => set({room}),
            clearRoom: () => set({room: null})
        }),
        {
            name: "room-storage",
            storage: typeof window !== "undefined"
                ? createJSONStorage(() => localStorage)
                : undefined,

        }
    )
)

export default useRoomStore;
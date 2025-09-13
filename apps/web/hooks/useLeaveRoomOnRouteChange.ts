// hooks/useLeaveRoomOnRouteChange.ts
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSocket } from './useSocket';
import { useUser } from '@/hooks/useUser';
import useRoomStore from '@/store/roomStore';

export default function useLeaveRoomOnRouteChange() {
  const socket = useSocket();
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const room = useRoomStore((s) => s.room);
  const { user } = useUser();

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }

    const wasInRoom = prevPath.current.startsWith('/space/');
    const isNowInRoom = pathname.startsWith('/space/');

    console.log('[useLeaveRoomOnRouteChange]', {
      prevPath: prevPath.current,
      pathname,
      wasInRoom,
      isNowInRoom,
      socketConnected: socket?.connected,
      room,
      user,
    });

    if (wasInRoom && !isNowInRoom && socket?.connected && room && user) {
      socket.emit('leave-room', {
        roomId: room.roomId,
        userId: user.id,
      });
      console.log(`[leave-room] User ${user.id} left room ${room.roomId} due to route change to ${pathname}`);
    }

    prevPath.current = pathname;
  }, [pathname, socket, room, user]);

  // Handle tab/window close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (room && user && socket?.connected) {
        socket.emit('leave-room', {
          roomId: room.roomId,
          userId: user.id,
        });
        console.log(`[leave-room] User ${user.id} left room ${room.roomId} on unload`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [room, user, socket]);
}

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }
    const next = io(serverUrl, { auth: { token }, transports: ['websocket'] });
    setSocket(next);
    return () => {
      next.disconnect();
      setSocket(null);
    };
  }, [token]);

  return socket;
}


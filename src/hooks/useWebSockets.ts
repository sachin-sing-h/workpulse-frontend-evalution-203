import { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useSessionStore } from '../store/useSessionStore';


const WS_URL = import.meta.env.VITE_WS_BASE_URL;

export const useWebSockets = () => {
  const { token } = useAuth();
  const socketRef = useRef<any>(null);

  const { setActiveSession } = useSessionStore();

  useEffect(() => {
    if (!token) return;

    socketRef.current = socketIOClient(WS_URL, {

      auth: { token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('session:update', (updatedSession: any) => {
      console.log('Session updated from server', updatedSession);
      setActiveSession(updatedSession);
    });

    socket.on('alert:inactive', (data: { sessionId: string; message: string }) => {
      console.warn('Inactive Alert:', data.message);
      alert(data.message);
      // You could trigger a UI notification here
    });

    socket.on('productivity:update', (data: any) => {
      console.log('Productivity update', data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    return () => {
      socket.disconnect();
    };
  }, [token, setActiveSession]);

  return socketRef.current;
};

import { create } from 'zustand';
import { Session } from '../types';

interface SessionState {
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

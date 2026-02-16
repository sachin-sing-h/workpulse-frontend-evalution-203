import { useCallback } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { sessionService } from '../api/sessions';

export const useSession = () => {
  const { activeSession, setActiveSession, setIsLoading } = useSessionStore();

  const startSession = useCallback(async (projectId?: string) => {
    setIsLoading(true);
    try {
      const session = await sessionService.startSession(projectId);
      setActiveSession(session);
      return session;
    } catch (error) {
      console.error('Failed to start session', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setActiveSession, setIsLoading]);

  const stopSession = useCallback(async () => {
    if (!activeSession) return;
    setIsLoading(true);
    try {
      await sessionService.stopSession(activeSession.id);
      setActiveSession(null);
    } catch (error) {
      console.error('Failed to stop session', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, setActiveSession, setIsLoading]);

  const checkActiveSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await sessionService.getActiveSession();
      setActiveSession(session);
    } catch (error) {
      // It's okay if there's no active session
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [setActiveSession, setIsLoading]);

  return {
    activeSession,
    startSession,
    stopSession,
    checkActiveSession,
  };
};

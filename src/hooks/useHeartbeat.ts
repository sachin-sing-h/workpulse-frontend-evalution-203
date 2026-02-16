import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sessionService } from '../api/sessions';
import { Activity, ActivityType } from '../types';

/**
 * Check if we are running inside Electron.
 */
const isElectron = (): boolean => {
  return !!(window as any).electron;
};

export const useHeartbeat = (sessionId: string | undefined) => {
  const lastActivityTime = useRef<number>(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Queue to hold activities before bulk sync
  // We store the "clean" activity ready for sending
  const activityQueue = useRef<Omit<Activity, 'id' | 'session_id' | 'created_at' | 'updated_at'>[]>([]);
  const queueKey = sessionId ? `activity_queue_${sessionId}` : null;

  // Load queue from local storage on mount/session change
  useEffect(() => {
    if (!queueKey) return;
    const stored = localStorage.getItem(queueKey);
    if (stored) {
      try {
        activityQueue.current = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse activity queue", e);
      }
    } else {
        activityQueue.current = [];
    }
  }, [queueKey]);

  // Persist queue helper
  const saveQueue = () => {
    if (queueKey) {
        localStorage.setItem(queueKey, JSON.stringify(activityQueue.current));
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const recordActivity = () => {
      lastActivityTime.current = Date.now();
    };

    // Add comprehensive event listeners (for browser-only tracking)
    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('click', recordActivity);
    window.addEventListener('scroll', recordActivity);

    // Accumulation Interval (every 60s)
    const accumulationInterval = setInterval(async () => {
      let activityType: ActivityType;
      let url: string;

      if (isElectron() && window.electron?.getTrackingData) {
        // ── ELECTRON MODE: Use native system-level tracking ──
        try {
          const trackingData = await window.electron.getTrackingData();

          if (trackingData) {
            activityType = trackingData.isSystemIdle ? 'idle' : 'active';
            // Use the active window's app name + title as the "url" field
            url = trackingData.activeWindowUrl
              || `${trackingData.activeWindowApp}: ${trackingData.activeWindowTitle}`;
          } else {
            // Fallback if tracking data is null
            activityType = 'idle';
            url = 'Unknown (tracking data unavailable)';
          }
        } catch (error) {
          console.error('Electron tracking failed, falling back to browser:', error);
          // Fallback to browser-based detection
          const now = Date.now();
          const isIdle = (now - lastActivityTime.current) >= 60000;
          activityType = isIdle ? 'idle' : 'active';
          url = window.location.href;
        }
      } else {
        // ── BROWSER MODE: Original browser-based detection ──
        const now = Date.now();
        const idleThreshold = 60 * 1000;
        const isIdle = (now - lastActivityTime.current) >= idleThreshold;
        const isVisible = document.visibilityState === 'visible';
        
        activityType = (isIdle || !isVisible) ? 'idle' : 'active';
        url = window.location.hostname === 'localhost' ? 'https://work-pulse.app/dashboard' : window.location.href;
      }

      const activity: Omit<Activity, 'id' | 'session_id' | 'created_at' | 'updated_at'> = {
        activity_type: activityType,
        duration_seconds: 60,
        url,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        client_activity_id: uuidv4(),
      };

      // Add to queue
      activityQueue.current.push(activity);
      saveQueue();
    }, 60000);

    // Bulk Sync / Flush Logic
    const flushQueue = async () => {
        if (activityQueue.current.length === 0) return;

        // Take a snapshot of current queue to send
        const activitiesToSync = [...activityQueue.current];
        
        try {
            await sessionService.bulkSyncActivities(sessionId, activitiesToSync);
            // On success, filter out the synced items
            const syncedIds = new Set(activitiesToSync.map(a => a.client_activity_id));
            activityQueue.current = activityQueue.current.filter(a => !syncedIds.has(a.client_activity_id));
            saveQueue();
        } catch (error) {
            console.error('Bulk sync failed, keeping in queue', error);
        }
    };

    // Bulk Sync Interval (every 5 minutes)
    const syncInterval = setInterval(async () => {
        if (activityQueue.current.length > 0 && navigator.onLine) {
            await flushQueue();
        }
    }, 5 * 60 * 1000);

    // Initial flush of any stored offline data if we are online now
    if (navigator.onLine && activityQueue.current.length > 0) {
        flushQueue();
    }

    return () => {
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('click', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      
      clearInterval(accumulationInterval);
      clearInterval(syncInterval);
      
      // Best-effort flush on unmount/session change
      if (activityQueue.current.length > 0 && navigator.onLine) {
          flushQueue();
      }
    };
  }, [sessionId]);

  return { isOnline };
};

import { powerMonitor } from 'electron';
import activeWindow from 'active-win';

export interface TrackingData {
  isSystemIdle: boolean;
  systemIdleTime: number;       // seconds
  activeWindowTitle: string;
  activeWindowApp: string;
  activeWindowUrl?: string;     // for browsers
  timestamp: string;
}

/**
 * Get system idle time in seconds using Electron's powerMonitor.
 */
export function getSystemIdleTime(): number {
  return powerMonitor.getSystemIdleTime();
}

/**
 * Get the currently active window information.
 * Returns the window title, owner app name, and URL (if it's a browser).
 */
export async function getActiveWindowInfo(): Promise<{
  title: string;
  app: string;
  url?: string;
} | null> {
  try {
    const result = await activeWindow();
    if (!result) return null;
    return {
      title: result.title,
      app: result.owner.name,
      url: (result as any).url || undefined,
    };
  } catch (error) {
    console.error('Failed to get active window:', error);
    return null;
  }
}

/**
 * Collect a full tracking snapshot:
 * - System idle time
 * - Active window info (title + app name + URL)
 */
export async function collectTrackingData(idleThresholdSeconds = 60): Promise<TrackingData> {
  const systemIdleTime = getSystemIdleTime();
  const windowInfo = await getActiveWindowInfo();

  return {
    isSystemIdle: systemIdleTime >= idleThresholdSeconds,
    systemIdleTime,
    activeWindowTitle: windowInfo?.title || 'Unknown',
    activeWindowApp: windowInfo?.app || 'Unknown',
    activeWindowUrl: windowInfo?.url,
    timestamp: new Date().toISOString(),
  };
}

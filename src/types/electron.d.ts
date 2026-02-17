export interface ElectronTrackingData {
  isSystemIdle: boolean;
  systemIdleTime: number;
  activeWindowTitle: string;
  activeWindowApp: string;
  activeWindowUrl: string | null;
  timestamp: string;
}

export interface ElectronAPI {
  getActiveWindow: () => Promise<any>;
  getTrackingData: () => Promise<ElectronTrackingData>;
  log: (msg: string) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI | undefined;
  }
}

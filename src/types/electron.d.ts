export interface ElectronTrackingData {
  isSystemIdle: boolean;
  systemIdleTime: number;
  activeWindowTitle: string;
  activeWindowApp: string;
  activeWindowUrl?: string;
  timestamp: string;
}

export interface ElectronAPI {
  getActiveWindow: () => Promise<any>;
  getTrackingData: () => Promise<ElectronTrackingData>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

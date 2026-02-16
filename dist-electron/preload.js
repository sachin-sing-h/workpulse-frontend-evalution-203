import { contextBridge as t, ipcRenderer as e } from "electron";
t.exposeInMainWorld("electron", {
  getActiveWindow: () => e.invoke("get-active-window"),
  getTrackingData: () => e.invoke("get-tracking-data")
});

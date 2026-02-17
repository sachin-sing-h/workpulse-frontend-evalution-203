import { contextBridge as n, ipcRenderer as e } from "electron";
n.exposeInMainWorld("electron", {
  getActiveWindow: () => e.invoke("get-active-window"),
  getTrackingData: () => e.invoke("get-tracking-data"),
  log: (r) => e.send("renderer-log", r)
});
e.send("renderer-log", "Preload script executed successfully!");

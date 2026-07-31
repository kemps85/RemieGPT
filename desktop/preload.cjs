const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("remi", {
  onState: (callback) => {
    ipcRenderer.on("pet-state", (_event, state) => callback(state));
  },
  showMenu: () => ipcRenderer.send("show-menu"),
  setHovering: (hovering) => ipcRenderer.send("pet-hover", hovering)
});

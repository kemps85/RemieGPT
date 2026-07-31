const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("remi", {
  onState: (callback) => {
    ipcRenderer.on("pet-state", (_event, state) => callback(state));
  },
  showMenu: () => ipcRenderer.send("show-menu"),
  setHovering: (hovering) => ipcRenderer.send("pet-hover", hovering),
  startDrag: (x, y) => ipcRenderer.send("drag-start", { x, y }),
  moveDrag: () => ipcRenderer.send("drag-move"),
  endDrag: () => ipcRenderer.send("drag-end")
});

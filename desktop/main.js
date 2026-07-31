import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  powerMonitor,
  screen,
  shell,
  Tray
} from "electron";

import { ActivityState, PET_STATES } from "./activity-state.js";
import { AiMonitor } from "./ai-monitor.js";
import { GlobalInput } from "./global-input.js";
import { WebAiServer } from "./web-ai-server.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = "settings.json";
const DEFAULT_SIZE = 220;

let mainWindow;
let tray;
let activity;
let globalInput;
let aiMonitor;
let webAiServer;
let idleTimer;
let currentState = "idle";
let saveBoundsTimer;
let settings = {
  settingsVersion: 2,
  size: DEFAULT_SIZE,
  startWithWindows: false,
  clickThrough: false
};

function settingsPath() {
  return path.join(app.getPath("userData"), SETTINGS_FILE);
}

function loadSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
    settings = {
      ...settings,
      ...saved
    };
    if ((saved.settingsVersion ?? 0) < 2) {
      settings.settingsVersion = 2;
      settings.clickThrough = false;
    }
  } catch {
    // First launch uses defaults.
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
}

function defaultPosition(size) {
  const area = screen.getPrimaryDisplay().workArea;
  return {
    x: area.x + area.width - size - 18,
    y: area.y + area.height - size - 18
  };
}

function assetUrl(filename) {
  return pathToFileURL(
    path.join(app.getAppPath(), "assets", "source", filename)
  ).href;
}

function rendererState(name) {
  const state = PET_STATES[name] ?? PET_STATES.idle;
  return {
    name,
    label: state.label,
    src: assetUrl(state.asset)
  };
}

function sendState(name) {
  currentState = name;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("pet-state", rendererState(name));
  }
}

function setWindowSize(nextSize) {
  const size = Math.max(150, Math.min(360, nextSize));
  settings.size = size;
  mainWindow.setSize(size, size, true);
  saveSettings();
}

function applyClickThrough() {
  mainWindow.setIgnoreMouseEvents(settings.clickThrough, {
    forward: settings.clickThrough
  });
}

function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: "Remi lớn hơn",
      click: () => setWindowSize(settings.size + 20)
    },
    {
      label: "Remi nhỏ hơn",
      click: () => setWindowSize(settings.size - 20)
    },
    { type: "separator" },
    {
      label: "Cho chuột xuyên qua Remi",
      type: "checkbox",
      checked: settings.clickThrough,
      click: (item) => {
        settings.clickThrough = item.checked;
        applyClickThrough();
        saveSettings();
        tray?.setContextMenu(buildMenu());
      }
    },
    {
      label: "Cho phép kéo Remi",
      click: () => {
        settings.clickThrough = false;
        applyClickThrough();
        saveSettings();
        tray?.setContextMenu(buildMenu());
      }
    },
    { type: "separator" },
    {
      label: "Mở cùng Windows",
      type: "checkbox",
      checked: settings.startWithWindows,
      click: (item) => {
        settings.startWithWindows = item.checked;
        app.setLoginItemSettings({
          openAtLogin: item.checked,
          path: process.execPath
        });
        saveSettings();
      }
    },
    {
      label: "Đưa Remi về góc phải",
      click: () => {
        const { x, y } = defaultPosition(settings.size);
        mainWindow.setPosition(x, y, true);
      }
    },
    {
      label: "Mở phần hỗ trợ AI trên web",
      click: () => {
        const extensionDir = app.isPackaged
          ? path.join(process.resourcesPath, "browser-extension")
          : path.join(app.getAppPath(), "browser-extension");
        shell.openPath(extensionDir);
      }
    },
    { type: "separator" },
    {
      label: "Ẩn Remi",
      click: () => mainWindow.hide()
    },
    {
      label: "Thoát RemieGPT",
      click: () => app.quit()
    }
  ]);
}

function createWindow() {
  const position =
    Number.isInteger(settings.x) && Number.isInteger(settings.y)
      ? { x: settings.x, y: settings.y }
      : defaultPosition(settings.size);

  mainWindow = new BrowserWindow({
    width: settings.size,
    height: settings.size,
    x: position.x,
    y: position.y,
    transparent: true,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    icon: path.join(app.getAppPath(), "assets", "app-icon.png"),
    webPreferences: {
      preload: path.join(here, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const keepAboveWindows = () => {
    if (!mainWindow || mainWindow.isDestroyed() || !mainWindow.isVisible()) {
      return;
    }
    mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
    mainWindow.moveTop();
  };

  mainWindow.setFullScreenable(false);
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(here, "renderer", "index.html"));
  mainWindow.once("ready-to-show", () => {
    mainWindow.showInactive();
    applyClickThrough();
    keepAboveWindows();
    sendState(currentState);
  });
  mainWindow.on("show", keepAboveWindows);
  mainWindow.on("blur", keepAboveWindows);
  mainWindow.on("restore", keepAboveWindows);

  mainWindow.on("move", () => {
    clearTimeout(saveBoundsTimer);
    saveBoundsTimer = setTimeout(() => {
      const [x, y] = mainWindow.getPosition();
      settings.x = x;
      settings.y = y;
      saveSettings();
    }, 250);
  });

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(
    app.getAppPath(),
    "assets",
    "app-icon.png"
  );
  const icon = nativeImage.createFromPath(iconPath).resize({
    width: 20,
    height: 20,
    quality: "best"
  });

  tray = new Tray(icon);
  tray.setToolTip("RemieGPT");
  tray.setContextMenu(buildMenu());
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.showInactive();
    }
  });
}

function startActivityTracking() {
  activity = new ActivityState({ emit: sendState });
  globalInput = new GlobalInput(activity);
  globalInput.start();
  aiMonitor = new AiMonitor((source, mode) => {
    activity.setAiMode(source, mode);
  });
  aiMonitor.start();
  webAiServer = new WebAiServer((source, mode) => {
    activity.setAiMode(source, mode);
  });
  webAiServer.start();

  idleTimer = setInterval(() => {
    activity.noteIdleSeconds(powerMonitor.getSystemIdleTime());
  }, 1000);

  powerMonitor.on("lock-screen", () => activity.noteLock());
  powerMonitor.on("unlock-screen", () => activity.noteUnlock());
  powerMonitor.on("resume", () => activity.noteUnlock());
}

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  createTray();
  startActivityTracking();

  ipcMain.on("show-menu", () => {
    buildMenu().popup({ window: mainWindow });
  });
  ipcMain.on("pet-hover", (_event, hovering) => {
    activity.setHovering(Boolean(hovering));
  });

  app.on("activate", () => {
    mainWindow.showInactive();
  });
});

app.on("before-quit", async () => {
  app.isQuitting = true;
  clearInterval(idleTimer);
  clearTimeout(saveBoundsTimer);
  globalInput?.stop();
  await aiMonitor?.stop();
  await webAiServer?.stop();
  activity?.dispose();
  saveSettings();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

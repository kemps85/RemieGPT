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
import { ForegroundAiGate } from "./foreground-ai-gate.js";
import { ForegroundMonitor } from "./foreground-monitor.js";
import { GlobalInput } from "./global-input.js";
import { WebAiServer } from "./web-ai-server.js";
import {
  defaultPosition as positionInWorkArea,
  safeWindowPosition
} from "./window-bounds.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_FILE = "settings.json";
const PET_SIZE = 220;
const hasSingleInstanceLock = app.requestSingleInstanceLock();

let mainWindow;
let tray;
let activity;
let globalInput;
let aiMonitor;
let webAiServer;
let foregroundMonitor;
let foregroundAiGate;
let idleTimer;
let currentState = "idle";
let saveBoundsTimer;
let enforceSizeTimer;
let settings = {
  settingsVersion: 4,
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
    settings.settingsVersion = 4;
    // Every launch starts draggable. Click-through remains available from the
    // tray for the current session, but it must never strand Remi after restart.
    settings.clickThrough = false;
  } catch {
    // First launch uses defaults.
  }
  // Remi deliberately has a fixed size. Ignore stale settings from older
  // releases that offered size controls.
  delete settings.size;
  if (!Number.isInteger(settings.x) || !Number.isInteger(settings.y)) {
    delete settings.x;
    delete settings.y;
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
}

function defaultPosition(size) {
  return positionInWorkArea(size, screen.getPrimaryDisplay().workArea);
}

function safePosition(position, size = PET_SIZE) {
  return safeWindowPosition({
    position,
    size,
    workAreas: screen.getAllDisplays().map((display) => display.workArea),
    primaryWorkArea: screen.getPrimaryDisplay().workArea
  });
}

function keepWindowVisible() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [x, y] = mainWindow.getPosition();
  const position = safePosition({ x, y });
  if (position.x === x && position.y === y) return;
  mainWindow.setPosition(position.x, position.y, true);
  settings.x = position.x;
  settings.y = position.y;
  saveSettings();
}

function startupExecutablePath() {
  const portablePath = process.env.PORTABLE_EXECUTABLE_FILE;
  return portablePath && fs.existsSync(portablePath) ? portablePath : process.execPath;
}

function applyAutoStart(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: startupExecutablePath()
    });
    return true;
  } catch (error) {
    console.warn("auto-start", error?.message ?? "could not update setting");
    return false;
  }
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

function enforceWindowSize() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [width, height] = mainWindow.getSize();
  if (width === PET_SIZE && height === PET_SIZE) return;
  mainWindow.setSize(PET_SIZE, PET_SIZE, false);
  keepWindowVisible();
}

function applyClickThrough() {
  mainWindow.setIgnoreMouseEvents(settings.clickThrough, {
    forward: settings.clickThrough
  });
}

function buildMenu() {
  return Menu.buildFromTemplate([
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
        settings.startWithWindows = item.checked && applyAutoStart(true);
        if (!item.checked) applyAutoStart(false);
        saveSettings();
        tray?.setContextMenu(buildMenu());
      }
    },
    {
      label: "Đưa Remi về góc phải",
      click: () => {
        const { x, y } = defaultPosition(PET_SIZE);
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
      ? safePosition({ x: settings.x, y: settings.y })
      : defaultPosition(PET_SIZE);

  mainWindow = new BrowserWindow({
    width: PET_SIZE,
    height: PET_SIZE,
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
  mainWindow.setResizable(false);
  mainWindow.setMinimumSize(PET_SIZE, PET_SIZE);
  mainWindow.setMaximumSize(PET_SIZE, PET_SIZE);
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // A pinch or Ctrl + wheel must never turn a drag into a browser zoom.
  mainWindow.webContents.setZoomFactor(1);
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1).catch(() => {});
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

  mainWindow.on("resize", () => {
    clearTimeout(enforceSizeTimer);
    enforceSizeTimer = setTimeout(enforceWindowSize, 0);
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
  foregroundAiGate = new ForegroundAiGate(activity);
  globalInput = new GlobalInput(activity, {
    onKeyboard: () => foregroundAiGate.noteUserInput(),
    onPointer: () => foregroundAiGate.notePointerAction()
  });
  globalInput.start();
  aiMonitor = new AiMonitor((source, mode) => {
    foregroundAiGate.setAiMode(source, mode);
  });
  aiMonitor.start();
  webAiServer = new WebAiServer((source, mode, options) => {
    activity.setAiMode(source, mode, options);
  });
  webAiServer.start();
  const foregroundHelper = app.isPackaged
    ? path.join(process.resourcesPath, "helpers", "foreground-window.ps1")
    : path.join(app.getAppPath(), "desktop", "helpers", "foreground-window.ps1");
  foregroundMonitor = new ForegroundMonitor({
    helperPath: foregroundHelper,
    onChange: (info) => foregroundAiGate.setForeground(info)
  });
  foregroundMonitor.start();

  idleTimer = setInterval(() => {
    activity.noteIdleSeconds(powerMonitor.getSystemIdleTime());
  }, 1000);

  powerMonitor.on("lock-screen", () => activity.noteLock());
  powerMonitor.on("unlock-screen", () => activity.noteUnlock());
  powerMonitor.on("resume", () => activity.noteUnlock());
}

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.showInactive();
    mainWindow.moveTop();
  });

  app.whenReady().then(() => {
  loadSettings();
  createWindow();
  createTray();
  if (settings.startWithWindows && !applyAutoStart(true)) {
    settings.startWithWindows = false;
    saveSettings();
  }
  startActivityTracking();

  screen.on("display-added", keepWindowVisible);
  screen.on("display-removed", keepWindowVisible);
  screen.on("display-metrics-changed", keepWindowVisible);

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
}

app.on("before-quit", async () => {
  app.isQuitting = true;
  clearInterval(idleTimer);
  clearTimeout(saveBoundsTimer);
  clearTimeout(enforceSizeTimer);
  globalInput?.stop();
  foregroundMonitor?.stop();
  foregroundAiGate?.clear();
  await aiMonitor?.stop();
  await webAiServer?.stop();
  activity?.dispose();
  saveSettings();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

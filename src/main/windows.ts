import path from "node:path";
import { existsSync } from "node:fs";
import { app, BrowserWindow, Menu } from "electron";
import type { AppSettings, Avatar } from "../shared/types";

export interface AppState {
  settings: AppSettings;
  avatars: Avatar[];
}

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let moveSession: { startX: number; startY: number; windowX: number; windowY: number } | null = null;

export function createPetWindow(settings: AppSettings): BrowserWindow {
  if (petWindow && !petWindow.isDestroyed()) {
    return petWindow;
  }

  petWindow = new BrowserWindow({
    width: settings.petSize,
    height: settings.petSize,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  petWindow.setMenu(null);
  void loadRendererView(petWindow, "pet");

  petWindow.on("closed", () => {
    petWindow = null;
  });

  return petWindow;
}

export function openSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: 720,
    height: 560,
    minWidth: 520,
    minHeight: 420,
    show: false,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.setMenu(null);
  settingsWindow.once("ready-to-show", () => settingsWindow?.show());
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  void loadRendererView(settingsWindow, "settings");
  return settingsWindow;
}

export function hasPetWindow(): boolean {
  return Boolean(petWindow && !petWindow.isDestroyed());
}

export function setPetAlwaysOnTop(alwaysOnTop: boolean): void {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.setAlwaysOnTop(alwaysOnTop);
  }
}

export function resizePetWindow(size: number): void {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.setSize(size, size);
  }
}

export function beginPetMove(screenX: number, screenY: number): void {
  if (!petWindow || petWindow.isDestroyed()) return;
  const [windowX, windowY] = petWindow.getPosition();
  moveSession = { startX: screenX, startY: screenY, windowX, windowY };
}

export function movePet(screenX: number, screenY: number): void {
  if (!petWindow || petWindow.isDestroyed() || !moveSession) return;
  petWindow.setPosition(
    Math.round(moveSession.windowX + screenX - moveSession.startX),
    Math.round(moveSession.windowY + screenY - moveSession.startY),
    false,
  );
}

export function endPetMove(): void {
  moveSession = null;
}

export function showPetContextMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: "Open Settings",
      click: () => {
        openSettingsWindow();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  menu.popup({
    window: petWindow && !petWindow.isDestroyed() ? petWindow : undefined,
  });
}

export function broadcastState(state: AppState): void {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send("state:changed", state);
    }
  }
}

function getPreloadPath(): string {
  const compiledPreloadPath = path.join(app.getAppPath(), "dist/main/main/preload.js");
  return existsSync(compiledPreloadPath) ? compiledPreloadPath : path.join(__dirname, "preload.js");
}

async function loadRendererView(window: BrowserWindow, view: "pet" | "settings"): Promise<void> {
  const devServer = process.env.DESKTOP_PET_DEV_SERVER;
  if (!app.isPackaged && devServer) {
    await window.loadURL(`${devServer}?view=${view}`);
    return;
  }

  await window.loadFile(path.join(app.getAppPath(), "dist/renderer/index.html"), {
    query: { view },
  });
}

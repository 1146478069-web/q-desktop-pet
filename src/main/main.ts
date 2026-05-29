import path from "node:path";
import fs from "node:fs";
import { app } from "electron";
import { registerIpcHandlers } from "./ipc";
import { SettingsStore } from "./settings-store";
import { createPetWindow, hasPetWindow } from "./windows";

function log(message: string): void {
  fs.appendFileSync(path.join(process.cwd(), ".runtime.log"), `${new Date().toISOString()} ${message}\n`, "utf8");
}

function getAppDataDir(): string {
  return path.join(app.getPath("userData"), "data");
}

app.whenReady().then(async () => {
  log("app ready");
  const appDataDir = getAppDataDir();
  const settingsStore = new SettingsStore(appDataDir);
  const settings = await settingsStore.load();

  registerIpcHandlers(appDataDir);
  createPetWindow(settings);
  log("pet window created");
}).catch((error) => {
  log(`boot failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  app.quit();
});

app.on("activate", async () => {
  log("activate");
  if (!hasPetWindow()) {
    const settingsStore = new SettingsStore(getAppDataDir());
    createPetWindow(await settingsStore.load());
  }
});

app.on("window-all-closed", () => {
  // Keep the process alive for tray/menu-driven reopen flows; explicit quit still exits.
});

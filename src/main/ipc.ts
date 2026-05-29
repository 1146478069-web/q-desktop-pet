import path from "node:path";
import { app, dialog, ipcMain } from "electron";
import type { AppSettings, AudioEffectKind, AudioUploadResult, AvatarUploadResult } from "../shared/types";
import { isSupportedAudioPath, isSupportedImagePath } from "../shared/validation";
import { AudioLibrary } from "./audio-library";
import { AvatarLibrary } from "./avatar-library";
import { LocalAvatarGenerator } from "./avatar-generator";
import { ElectronImageProcessor } from "./electron-image-processor";
import { SettingsStore } from "./settings-store";
import {
  broadcastState,
  openSettingsWindow,
  resizePetWindow,
  setPetAlwaysOnTop,
  showPetContextMenu,
  beginPetMove,
  endPetMove,
  movePet,
  type AppState,
} from "./windows";

const AVATAR_MAX_SIZE = 512;

export function registerIpcHandlers(appDataDir: string): void {
  const settingsStore = new SettingsStore(appDataDir);
  const avatarLibrary = new AvatarLibrary(appDataDir);
  const audioLibrary = new AudioLibrary(appDataDir);
  const avatarGenerator = new LocalAvatarGenerator(new ElectronImageProcessor());

  async function getState(): Promise<AppState> {
    const [settings, avatars] = await Promise.all([settingsStore.load(), avatarLibrary.list()]);
    return { settings, avatars };
  }

  async function saveAndBroadcastSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const settings = await settingsStore.save(patch);
    const avatars = await avatarLibrary.list();

    setPetAlwaysOnTop(settings.alwaysOnTop);
    resizePetWindow(settings.petSize);
    broadcastState({ settings, avatars });

    return settings;
  }

  ipcMain.handle("state:get", async () => getState());

  ipcMain.handle("avatar:choose", async (): Promise<AvatarUploadResult> => {
    const result = await dialog.showOpenDialog({
      title: "Choose Pet Avatar",
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg", "webp"],
        },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false, message: "No avatar file selected." };
    }

    const [sourcePath] = result.filePaths;
    if (!isSupportedImagePath(sourcePath)) {
      return { ok: false, message: "Choose a PNG, JPG, JPEG, or WebP image." };
    }

    try {
      const avatar = await avatarGenerator.generate({
        sourcePath,
        outputDir: avatarLibrary.avatarDir,
        displayName: path.parse(sourcePath).name,
        maxSize: AVATAR_MAX_SIZE,
      });

      const avatars = await avatarLibrary.add(avatar);
      const settings = await settingsStore.save({ activeAvatarId: avatar.id });

      setPetAlwaysOnTop(settings.alwaysOnTop);
      resizePetWindow(settings.petSize);
      broadcastState({ settings, avatars });

      return { ok: true, avatar };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to add avatar.",
      };
    }
  });

  ipcMain.handle("avatar:set-active", async (_event, id: string): Promise<void> => {
    await saveAndBroadcastSettings({ activeAvatarId: id });
  });

  ipcMain.handle("audio:choose", async (_event, kind: AudioEffectKind): Promise<AudioUploadResult> => {
    const result = await dialog.showOpenDialog({
      title: "Choose Reaction Sound",
      properties: ["openFile"],
      filters: [{ name: "Audio", extensions: ["mp3", "wav", "ogg", "m4a"] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false, message: "No audio file selected." };
    }

    const [sourcePath] = result.filePaths;
    if (!isSupportedAudioPath(sourcePath)) {
      return { ok: false, message: "Choose an MP3, WAV, OGG, or M4A file." };
    }

    try {
      const effect = await audioLibrary.importEffect(kind, sourcePath);
      const current = await settingsStore.load();
      await saveAndBroadcastSettings({
        audioEffects: {
          ...current.audioEffects,
          [kind]: effect,
        },
      });
      return { ok: true, effect };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to add audio.",
      };
    }
  });

  ipcMain.handle("settings:update", async (_event, patch: Partial<AppSettings>): Promise<AppSettings> => {
    return saveAndBroadcastSettings(patch);
  });

  ipcMain.handle("settings:open", async (): Promise<void> => {
    openSettingsWindow();
  });

  ipcMain.handle("pet:context-menu", async (): Promise<void> => {
    showPetContextMenu();
  });

  ipcMain.handle("pet:move-begin", async (_event, point: { screenX: number; screenY: number }): Promise<void> => {
    beginPetMove(point.screenX, point.screenY);
  });

  ipcMain.handle("pet:move", async (_event, point: { screenX: number; screenY: number }): Promise<void> => {
    movePet(point.screenX, point.screenY);
  });

  ipcMain.handle("pet:move-end", async (): Promise<void> => {
    endPetMove();
  });

  ipcMain.handle("app:quit", async (): Promise<void> => {
    app.quit();
  });
}

import { contextBridge, ipcRenderer } from "electron";
import type { AppSettings, AudioEffectKind, AudioUploadResult, Avatar, AvatarUploadResult } from "../shared/types";

export interface DesktopPetApi {
  getState(): Promise<{ settings: AppSettings; avatars: Avatar[] }>;
  chooseAvatarFile(): Promise<AvatarUploadResult>;
  chooseAudioFile(kind: AudioEffectKind): Promise<AudioUploadResult>;
  setActiveAvatar(id: string): Promise<void>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  openSettings(): Promise<void>;
  quit(): Promise<void>;
  showContextMenu(): Promise<void>;
  beginMove(point: { screenX: number; screenY: number }): Promise<void>;
  movePet(point: { screenX: number; screenY: number }): Promise<void>;
  endMove(): Promise<void>;
  onStateChanged(callback: (state: { settings: AppSettings; avatars: Avatar[] }) => void): () => void;
}

const desktopPet: DesktopPetApi = {
  getState: () => ipcRenderer.invoke("state:get"),
  chooseAvatarFile: () => ipcRenderer.invoke("avatar:choose"),
  chooseAudioFile: (kind) => ipcRenderer.invoke("audio:choose", kind),
  setActiveAvatar: (id) => ipcRenderer.invoke("avatar:set-active", id),
  updateSettings: (settings) => ipcRenderer.invoke("settings:update", settings),
  openSettings: () => ipcRenderer.invoke("settings:open"),
  quit: () => ipcRenderer.invoke("app:quit"),
  showContextMenu: () => ipcRenderer.invoke("pet:context-menu"),
  beginMove: (point) => ipcRenderer.invoke("pet:move-begin", point),
  movePet: (point) => ipcRenderer.invoke("pet:move", point),
  endMove: () => ipcRenderer.invoke("pet:move-end"),
  onStateChanged: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, state: { settings: AppSettings; avatars: Avatar[] }) => {
      callback(state);
    };

    ipcRenderer.on("state:changed", listener);
    return () => {
      ipcRenderer.removeListener("state:changed", listener);
    };
  },
};

contextBridge.exposeInMainWorld("desktopPet", desktopPet);

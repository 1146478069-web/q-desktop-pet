/// <reference types="vite/client" />

import type {
  AppSettings,
  AudioEffectKind,
  AudioUploadResult,
  Avatar,
  AvatarUploadResult
} from '../shared/types';

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

declare global {
  interface Window {
    desktopPet: DesktopPetApi;
  }
}

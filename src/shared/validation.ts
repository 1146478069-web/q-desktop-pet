import type { AppSettings } from "./types";

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const SUPPORTED_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a"]);

export const DEFAULT_SETTINGS: AppSettings = {
  activeAvatarId: null,
  petSize: 180,
  alwaysOnTop: true,
  animationsEnabled: true,
  bubblesEnabled: true,
  audioEffects: {},
};

export function isSupportedImagePath(filePath: string): boolean {
  return SUPPORTED_IMAGE_EXTENSIONS.has(getFileExtension(filePath));
}

export function isSupportedAudioPath(filePath: string): boolean {
  return SUPPORTED_AUDIO_EXTENSIONS.has(getFileExtension(filePath));
}

function getFileExtension(filePath: string): string {
  const fileName = filePath.split(/[\\/]/).pop() ?? "";
  const lastDotIndex = fileName.lastIndexOf(".");

  return lastDotIndex > 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
}

export function clampPetSize(size: number): number {
  if (!Number.isFinite(size)) {
    return DEFAULT_SETTINGS.petSize;
  }

  return Math.min(320, Math.max(96, Math.round(size)));
}

export function mergeSettings(input: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...input,
    petSize: clampPetSize(input.petSize ?? DEFAULT_SETTINGS.petSize),
    activeAvatarId: input.activeAvatarId ?? DEFAULT_SETTINGS.activeAvatarId,
    audioEffects: input.audioEffects ?? DEFAULT_SETTINGS.audioEffects,
  };
}

export interface Avatar {
  id: string;
  name: string;
  originalPath: string;
  assetPath: string;
  createdAt: string;
}

export type PetVisualMode = "classic" | "paper3d";
export type PetMotionIntensity = "soft" | "lively";

export interface AppSettings {
  activeAvatarId: string | null;
  petSize: number;
  alwaysOnTop: boolean;
  animationsEnabled: boolean;
  bubblesEnabled: boolean;
  audioEffects: Partial<Record<AudioEffectKind, AudioEffect>>;
  visualMode: PetVisualMode;
  motionIntensity: PetMotionIntensity;
}

export type AudioEffectKind = "poke" | "annoyed" | "reward";

export interface AudioEffect {
  kind: AudioEffectKind;
  name: string;
  originalPath: string;
  assetPath: string;
  updatedAt: string;
}

export interface AvatarGenerationInput {
  sourcePath: string;
  outputDir: string;
  displayName: string;
  maxSize: number;
}

export interface GeneratedAvatar {
  id: string;
  name: string;
  originalPath: string;
  assetPath: string;
  createdAt: string;
}

export interface AvatarUploadResult {
  ok: boolean;
  avatar?: Avatar;
  message?: string;
}

export interface AudioUploadResult {
  ok: boolean;
  effect?: AudioEffect;
  message?: string;
}

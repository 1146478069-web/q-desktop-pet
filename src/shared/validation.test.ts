import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, clampPetSize, isSupportedAudioPath, isSupportedImagePath, mergeSettings } from "./validation";

describe("isSupportedImagePath", () => {
  it("accepts png, jpg, jpeg, and webp files case-insensitively", () => {
    expect(isSupportedImagePath("pet.PNG")).toBe(true);
    expect(isSupportedImagePath("pet.jpg")).toBe(true);
    expect(isSupportedImagePath("pet.JPEG")).toBe(true);
    expect(isSupportedImagePath("pet.webp")).toBe(true);
    expect(isSupportedImagePath("C:\\pets\\buddy.WeBp")).toBe(true);
  });

  it("rejects unsupported, text, and extensionless files", () => {
    expect(isSupportedImagePath("pet.gif")).toBe(false);
    expect(isSupportedImagePath("notes.txt")).toBe(false);
    expect(isSupportedImagePath("pet")).toBe(false);
  });
});

describe("isSupportedAudioPath", () => {
  it("accepts mp3, wav, ogg, and m4a files case-insensitively", () => {
    expect(isSupportedAudioPath("poke.MP3")).toBe(true);
    expect(isSupportedAudioPath("reward.wav")).toBe(true);
    expect(isSupportedAudioPath("annoyed.OGG")).toBe(true);
    expect(isSupportedAudioPath("voice.m4a")).toBe(true);
  });

  it("rejects unsupported and extensionless files", () => {
    expect(isSupportedAudioPath("clip.flac")).toBe(false);
    expect(isSupportedAudioPath("clip.txt")).toBe(false);
    expect(isSupportedAudioPath("clip")).toBe(false);
  });
});

describe("clampPetSize", () => {
  it("returns the default size for non-finite values", () => {
    expect(clampPetSize(Number.NaN)).toBe(DEFAULT_SETTINGS.petSize);
    expect(clampPetSize(Number.POSITIVE_INFINITY)).toBe(DEFAULT_SETTINGS.petSize);
  });

  it("rounds finite values and clamps them to the supported range", () => {
    expect(clampPetSize(95.6)).toBe(96);
    expect(clampPetSize(180.4)).toBe(180);
    expect(clampPetSize(319.6)).toBe(320);
    expect(clampPetSize(321)).toBe(320);
  });
});

describe("mergeSettings", () => {
  it("keeps defaults for missing values and clamps pet size", () => {
    expect(mergeSettings({ petSize: 30 })).toEqual({
      ...DEFAULT_SETTINGS,
      petSize: 96,
    });

    expect(mergeSettings({ petSize: 500, animationsEnabled: false })).toEqual({
      ...DEFAULT_SETTINGS,
      petSize: 320,
      animationsEnabled: false,
    });

    expect(mergeSettings({ activeAvatarId: "avatar-1" })).toEqual({
      ...DEFAULT_SETTINGS,
      activeAvatarId: "avatar-1",
    });

    expect(mergeSettings({ audioEffects: { poke: { kind: "poke", name: "Poke", originalPath: "a.mp3", assetPath: "b.mp3", updatedAt: "2026-05-29T00:00:00.000Z" } } })).toEqual({
      ...DEFAULT_SETTINGS,
      audioEffects: {
        poke: { kind: "poke", name: "Poke", originalPath: "a.mp3", assetPath: "b.mp3", updatedAt: "2026-05-29T00:00:00.000Z" },
      },
    });
  });
});

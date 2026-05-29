import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../shared/validation";
import { SettingsStore } from "./settings-store";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "settings-store-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("SettingsStore", () => {
  it("returns default settings when no settings file exists", async () => {
    const appDataDir = await makeTempDir();
    const store = new SettingsStore(appDataDir);

    await expect(store.load()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("returns default settings when the settings file is invalid JSON", async () => {
    const appDataDir = await makeTempDir();
    await writeFile(path.join(appDataDir, "settings.json"), "{not json", "utf8");

    const store = new SettingsStore(appDataDir);

    await expect(store.load()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("persists merged settings and clamps pet size", async () => {
    const appDataDir = await makeTempDir();
    const store = new SettingsStore(appDataDir);

    const firstSave = await store.save({
      activeAvatarId: "avatar-1",
      petSize: 999,
      animationsEnabled: false,
    });
    const secondSave = await store.save({
      bubblesEnabled: false,
      petSize: 95,
    });

    expect(firstSave).toEqual({
      ...DEFAULT_SETTINGS,
      activeAvatarId: "avatar-1",
      petSize: 320,
      animationsEnabled: false,
    });
    expect(secondSave).toEqual({
      ...DEFAULT_SETTINGS,
      activeAvatarId: "avatar-1",
      petSize: 96,
      animationsEnabled: false,
      bubblesEnabled: false,
    });
    await expect(store.load()).resolves.toEqual(secondSave);

    const fileContents = await readFile(path.join(appDataDir, "settings.json"), "utf8");
    expect(fileContents).toBe(`${JSON.stringify(secondSave, null, 2)}\n`);
  });
});

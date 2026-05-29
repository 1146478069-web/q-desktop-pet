import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { AudioLibrary } from "./audio-library";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "audio-library-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("AudioLibrary", () => {
  it("copies an audio file into app data with deterministic metadata", async () => {
    const appDataDir = await makeTempDir();
    const sourcePath = path.join(appDataDir, "source.mp3");
    await writeFile(sourcePath, "sound bytes", "utf8");
    const library = new AudioLibrary(appDataDir, () => new Date("2026-05-29T00:00:00.000Z"));

    const effect = await library.importEffect("poke", sourcePath);

    expect(effect).toEqual({
      kind: "poke",
      name: "source",
      originalPath: sourcePath,
      assetPath: path.join(appDataDir, "audio", "poke.mp3"),
      updatedAt: "2026-05-29T00:00:00.000Z",
    });
    await expect(readFile(effect.assetPath, "utf8")).resolves.toBe("sound bytes");
  });
});

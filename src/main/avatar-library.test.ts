import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { Avatar } from "../shared/types";
import { AvatarLibrary } from "./avatar-library";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "avatar-library-"));
  tempDirs.push(dir);
  return dir;
}

function avatar(overrides: Partial<Avatar>): Avatar {
  return {
    id: "avatar-1",
    name: "Avatar 1",
    originalPath: "original.png",
    assetPath: "asset.png",
    createdAt: "2026-05-28T01:00:00.000Z",
    ...overrides,
  };
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("AvatarLibrary", () => {
  it("starts empty when the library file is missing, unreadable, or invalid", async () => {
    const missingDir = await makeTempDir();
    await expect(new AvatarLibrary(missingDir).list()).resolves.toEqual([]);

    const invalidDir = await makeTempDir();
    await writeFile(path.join(invalidDir, "avatars.json"), "{not json", "utf8");
    await expect(new AvatarLibrary(invalidDir).list()).resolves.toEqual([]);

    const malformedDir = await makeTempDir();
    await writeFile(path.join(malformedDir, "avatars.json"), JSON.stringify([{ id: "missing-fields" }]), "utf8");
    await expect(new AvatarLibrary(malformedDir).list()).resolves.toEqual([]);
  });

  it("stores avatars newest-first and replaces duplicate ids", async () => {
    const appDataDir = await makeTempDir();
    const library = new AvatarLibrary(appDataDir);

    const older = avatar({
      id: "older",
      name: "Older",
      createdAt: "2026-05-27T10:00:00.000Z",
    });
    const newer = avatar({
      id: "newer",
      name: "Newer",
      createdAt: "2026-05-28T10:00:00.000Z",
    });
    const replacement = avatar({
      id: "older",
      name: "Older Replacement",
      createdAt: "2026-05-29T10:00:00.000Z",
    });

    await expect(library.add(older)).resolves.toEqual([older]);
    await expect(library.add(newer)).resolves.toEqual([newer, older]);
    await expect(library.add(replacement)).resolves.toEqual([replacement, newer]);

    await expect(library.list()).resolves.toEqual([replacement, newer]);
    await expect(readFile(path.join(appDataDir, "avatars.json"), "utf8")).resolves.toBe(
      `${JSON.stringify([replacement, newer], null, 2)}\n`,
    );
  });
});

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LocalAvatarGenerator, type ImageProcessor } from "./avatar-generator";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "avatar-generator-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("LocalAvatarGenerator", () => {
  it("copies the original and writes a normalized PNG asset with deterministic metadata", async () => {
    const tempDir = await makeTempDir();
    const sourcePath = path.join(tempDir, "source.jpg");
    const outputDir = path.join(tempDir, "avatars");
    await writeFile(sourcePath, "original image bytes", "utf8");

    const normalizeCalls: Array<{ inputPath: string; outputPath: string; maxSize: number }> = [];
    const imageProcessor: ImageProcessor = {
      async normalizeToPng(inputPath, outputPath, maxSize) {
        normalizeCalls.push({ inputPath, outputPath, maxSize });
        await writeFile(outputPath, "normalized png bytes", "utf8");
      },
    };
    const generator = new LocalAvatarGenerator(
      imageProcessor,
      () => "avatar-id",
      () => new Date("2026-05-28T12:34:56.000Z"),
    );

    const generated = await generator.generate({
      sourcePath,
      outputDir,
      displayName: "My Avatar",
      maxSize: 256,
    });

    const avatarDir = path.join(outputDir, "avatar-id");
    const originalPath = path.join(avatarDir, "original.jpg");
    const assetPath = path.join(avatarDir, "pet.png");

    expect(generated).toEqual({
      id: "avatar-id",
      name: "My Avatar",
      originalPath,
      assetPath,
      createdAt: "2026-05-28T12:34:56.000Z",
    });
    await expect(readFile(originalPath, "utf8")).resolves.toBe("original image bytes");
    await expect(readFile(assetPath, "utf8")).resolves.toBe("normalized png bytes");
    expect(normalizeCalls).toEqual([{ inputPath: sourcePath, outputPath: assetPath, maxSize: 256 }]);
  });
});

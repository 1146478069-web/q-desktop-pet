import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AvatarGenerationInput, GeneratedAvatar } from "../shared/types";

export interface AvatarGenerator {
  generate(input: AvatarGenerationInput): Promise<GeneratedAvatar>;
}

export interface ImageProcessor {
  normalizeToPng(inputPath: string, outputPath: string, maxSize: number): Promise<void>;
}

export class LocalAvatarGenerator implements AvatarGenerator {
  constructor(
    private readonly imageProcessor: ImageProcessor,
    private readonly createId: () => string = randomUUID,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async generate(input: AvatarGenerationInput): Promise<GeneratedAvatar> {
    const id = this.createId();
    const avatarDir = path.join(input.outputDir, id);
    const originalPath = path.join(avatarDir, `original${path.extname(input.sourcePath)}`);
    const assetPath = path.join(avatarDir, "pet.png");
    const createdAt = this.now().toISOString();

    await mkdir(avatarDir, { recursive: true });
    await copyFile(input.sourcePath, originalPath);
    await this.imageProcessor.normalizeToPng(input.sourcePath, assetPath, input.maxSize);

    return {
      id,
      name: input.displayName,
      originalPath,
      assetPath,
      createdAt,
    };
  }
}

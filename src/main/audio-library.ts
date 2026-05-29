import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { AudioEffect, AudioEffectKind } from "../shared/types";

export class AudioLibrary {
  readonly audioDir: string;

  constructor(
    private readonly appDataDir: string,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.audioDir = path.join(appDataDir, "audio");
  }

  async importEffect(kind: AudioEffectKind, sourcePath: string): Promise<AudioEffect> {
    await mkdir(this.audioDir, { recursive: true });
    const extension = path.extname(sourcePath).toLowerCase();
    const assetPath = path.join(this.audioDir, `${kind}${extension}`);
    await copyFile(sourcePath, assetPath);

    return {
      kind,
      name: path.basename(sourcePath, extension),
      originalPath: sourcePath,
      assetPath,
      updatedAt: this.now().toISOString(),
    };
  }
}

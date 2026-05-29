import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nativeImage } from "electron";
import { PNG } from "pngjs";
import type { ImageProcessor } from "./avatar-generator";
import { removeEdgeConnectedBackground, type RgbaImage } from "./image-cutout";

export class ElectronImageProcessor implements ImageProcessor {
  async normalizeToPng(inputPath: string, outputPath: string, maxSize: number): Promise<void> {
    const image = nativeImage.createFromPath(inputPath);

    if (image.isEmpty()) {
      throw new Error(`Unable to read image: ${inputPath}`);
    }

    const { width, height } = image.getSize();
    const squareSize = Math.min(width, height);
    const cropped = image.crop({
      x: Math.max(0, Math.floor((width - squareSize) / 2)),
      y: Math.max(0, Math.floor((height - squareSize) / 2)),
      width: squareSize,
      height: squareSize,
    });
    const outputSize = Math.min(maxSize, squareSize);
    const resized = cropped.resize({
      width: outputSize,
      height: outputSize,
      quality: "best",
    });
    const processed = removeEdgeConnectedBackground(nativeImageToRgba(resized));

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rgbaToPng(processed));
  }
}

function nativeImageToRgba(image: Electron.NativeImage): RgbaImage {
  const { width, height } = image.getSize();
  const bitmap = image.toBitmap();
  const data = new Uint8ClampedArray(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    const bitmapOffset = index * 4;
    data[bitmapOffset] = bitmap[bitmapOffset + 2];
    data[bitmapOffset + 1] = bitmap[bitmapOffset + 1];
    data[bitmapOffset + 2] = bitmap[bitmapOffset];
    data[bitmapOffset + 3] = bitmap[bitmapOffset + 3];
  }

  return { width, height, data };
}

function rgbaToPng(image: RgbaImage): Buffer {
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.data);
  return PNG.sync.write(png);
}

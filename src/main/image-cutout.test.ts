import { describe, expect, it } from "vitest";
import { estimateCornerBackground, removeEdgeConnectedBackground } from "./image-cutout";

describe("estimateCornerBackground", () => {
  it("averages the four corner colors", () => {
    const data = rgba([
      [255, 255, 255, 255], [0, 0, 0, 255],
      [0, 0, 0, 255], [255, 255, 255, 255],
    ]);

    expect(estimateCornerBackground({ width: 2, height: 2, data })).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe("removeEdgeConnectedBackground", () => {
  it("makes only edge-connected background pixels transparent", () => {
    const white = [255, 255, 255, 255] as const;
    const dark = [40, 40, 40, 255] as const;
    const input = rgba([
      white, white, white,
      white, dark, white,
      white, white, white,
    ]);

    const output = removeEdgeConnectedBackground({ width: 3, height: 3, data: input });

    expect(alphaAt(output.data, 0)).toBe(0);
    expect(alphaAt(output.data, 4)).toBe(255);
  });

  it("keeps enclosed pixels even when they match the background color", () => {
    const white = [255, 255, 255, 255] as const;
    const dark = [40, 40, 40, 255] as const;
    const input = rgba([
      white, white, white, white, white,
      white, dark, dark, dark, white,
      white, dark, white, dark, white,
      white, dark, dark, dark, white,
      white, white, white, white, white,
    ]);

    const output = removeEdgeConnectedBackground({ width: 5, height: 5, data: input });

    expect(alphaAt(output.data, 0)).toBe(0);
    expect(alphaAt(output.data, 12)).toBe(255);
  });
});

function rgba(pixels: ReadonlyArray<readonly [number, number, number, number]>): Uint8ClampedArray {
  return Uint8ClampedArray.from(pixels.flat());
}

function alphaAt(data: Uint8ClampedArray, pixelIndex: number): number {
  return data[pixelIndex * 4 + 3];
}

export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const BACKGROUND_THRESHOLD = 58;

export function estimateCornerBackground(image: RgbaImage): RgbColor {
  const corners = [
    pixelAt(image, 0, 0),
    pixelAt(image, image.width - 1, 0),
    pixelAt(image, 0, image.height - 1),
    pixelAt(image, image.width - 1, image.height - 1),
  ];

  return {
    r: Math.round(corners.reduce((sum, color) => sum + color.r, 0) / corners.length),
    g: Math.round(corners.reduce((sum, color) => sum + color.g, 0) / corners.length),
    b: Math.round(corners.reduce((sum, color) => sum + color.b, 0) / corners.length),
  };
}

export function removeEdgeConnectedBackground(image: RgbaImage): RgbaImage {
  const background = estimateCornerBackground(image);
  const output = new Uint8ClampedArray(image.data);
  const visited = new Uint8Array(image.width * image.height);
  const queue: number[] = [];

  for (let x = 0; x < image.width; x += 1) {
    enqueueIfBackground(image, background, visited, queue, x, 0);
    enqueueIfBackground(image, background, visited, queue, x, image.height - 1);
  }

  for (let y = 1; y < image.height - 1; y += 1) {
    enqueueIfBackground(image, background, visited, queue, 0, y);
    enqueueIfBackground(image, background, visited, queue, image.width - 1, y);
  }

  while (queue.length > 0) {
    const index = queue.shift() as number;
    const x = index % image.width;
    const y = Math.floor(index / image.width);
    output[index * 4 + 3] = 0;

    enqueueIfBackground(image, background, visited, queue, x + 1, y);
    enqueueIfBackground(image, background, visited, queue, x - 1, y);
    enqueueIfBackground(image, background, visited, queue, x, y + 1);
    enqueueIfBackground(image, background, visited, queue, x, y - 1);
  }

  return { width: image.width, height: image.height, data: output };
}

function enqueueIfBackground(
  image: RgbaImage,
  background: RgbColor,
  visited: Uint8Array,
  queue: number[],
  x: number,
  y: number,
): void {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const index = y * image.width + x;
  if (visited[index]) return;
  visited[index] = 1;

  const offset = index * 4;
  if (image.data[offset + 3] === 0) {
    queue.push(index);
    return;
  }

  const distance = colorDistance(
    { r: image.data[offset], g: image.data[offset + 1], b: image.data[offset + 2] },
    background,
  );

  if (distance <= BACKGROUND_THRESHOLD) {
    queue.push(index);
  }
}

function pixelAt(image: RgbaImage, x: number, y: number): RgbColor {
  const offset = (y * image.width + x) * 4;
  return {
    r: image.data[offset],
    g: image.data[offset + 1],
    b: image.data[offset + 2],
  };
}

function colorDistance(a: RgbColor, b: RgbColor): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

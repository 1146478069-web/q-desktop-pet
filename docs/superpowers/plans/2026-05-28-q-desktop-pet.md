# Q Desktop Pet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows Electron desktop pet app with a transparent draggable pet window, local avatar upload/processing, simple animation, speech bubbles, settings, and local persistence.

**Architecture:** Electron main process owns windows, menus, dialogs, and filesystem access. React renderer code owns the pet UI and settings UI. Shared TypeScript modules define avatar/settings types, validation, and service contracts so local avatar generation can later be replaced by an AI generator without changing the UI.

**Tech Stack:** Electron, React, TypeScript, Vite, Vitest, CSS animations, Electron `nativeImage` for first-pass local avatar normalization.

---

## File Structure

- `package.json`: scripts and runtime/dev dependencies.
- `tsconfig.json`: base TypeScript config.
- `tsconfig.node.json`: TypeScript config for Electron main/preload code.
- `vite.config.ts`: renderer build config.
- `vitest.config.ts`: unit test config.
- `index.html`: Vite entry with root node.
- `src/shared/types.ts`: shared `Avatar`, `AppSettings`, and generator types.
- `src/shared/validation.ts`: file type validation and default settings.
- `src/shared/validation.test.ts`: tests for validation and defaults.
- `src/main/main.ts`: Electron app bootstrap, IPC registration, window lifecycle.
- `src/main/windows.ts`: pet/settings window creation and broadcast helpers.
- `src/main/preload.ts`: safe API bridge exposed to React.
- `src/main/ipc.ts`: IPC handlers for settings, avatar upload, toggles, and window actions.
- `src/main/settings-store.ts`: JSON settings persistence under Electron app data.
- `src/main/settings-store.test.ts`: settings persistence tests using a temp directory.
- `src/main/avatar-library.ts`: avatar metadata persistence and asset path management.
- `src/main/avatar-library.test.ts`: avatar metadata tests.
- `src/main/avatar-generator.ts`: `AvatarGenerator` interface and `LocalAvatarGenerator`.
- `src/main/avatar-generator.test.ts`: generator behavior tests using a fake image processor.
- `src/main/electron-image-processor.ts`: Electron `nativeImage` adapter for resizing and PNG output.
- `src/renderer/App.tsx`: route between pet and settings UI based on query string.
- `src/renderer/main.tsx`: React bootstrap.
- `src/renderer/pet/PetWindow.tsx`: desktop pet experience.
- `src/renderer/pet/PetWindow.css`: transparent pet window styling and animations.
- `src/renderer/settings/SettingsWindow.tsx`: upload, avatar list, sliders, and toggles.
- `src/renderer/settings/SettingsWindow.css`: compact settings utility panel styling.
- `src/renderer/vite-env.d.ts`: renderer and preload API typings.
- `src/assets/default-pet.svg`: built-in fallback pet image.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/renderer/main.tsx`
- Create: `src/renderer/App.tsx`
- Create: `src/renderer/vite-env.d.ts`
- Create: `src/assets/default-pet.svg`

- [ ] **Step 1: Create package metadata and scripts**

Write `package.json`:

```json
{
  "name": "q-desktop-pet",
  "version": "0.1.0",
  "private": true,
  "main": "dist/main/main.js",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "dev:electron": "npm-run-all -p dev electron:watch",
    "electron:watch": "tsc -p tsconfig.node.json --watch --preserveWatchOutput",
    "electron:start": "electron .",
    "build": "tsc -p tsconfig.node.json && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit && tsc -p tsconfig.node.json --noEmit"
  },
  "dependencies": {
    "electron": "^31.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^24.1.0",
    "npm-run-all": "^4.1.5",
    "typescript": "^5.5.3",
    "vite": "^5.3.3",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create TypeScript and Vite config**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/renderer", "src/shared", "src/assets"]
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "CommonJS",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node", "electron"]
  },
  "include": ["src/main", "src/shared"]
}
```

Write `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/renderer",
    emptyOutDir: false,
  },
});
```

Write `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Create React entry files**

Write `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Q Desktop Pet</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/renderer/main.tsx"></script>
  </body>
</html>
```

Write `src/renderer/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Write `src/renderer/App.tsx`:

```tsx
import { PetWindow } from "./pet/PetWindow";
import { SettingsWindow } from "./settings/SettingsWindow";

export function App() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  if (view === "settings") {
    return <SettingsWindow />;
  }

  return <PetWindow />;
}
```

Write `src/renderer/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

import type { AppSettings, Avatar, AvatarUploadResult } from "../shared/types";

export interface DesktopPetApi {
  getState(): Promise<{ settings: AppSettings; avatars: Avatar[] }>;
  chooseAvatarFile(): Promise<AvatarUploadResult>;
  setActiveAvatar(id: string): Promise<void>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  openSettings(): Promise<void>;
  quit(): Promise<void>;
  onStateChanged(callback: (state: { settings: AppSettings; avatars: Avatar[] }) => void): () => void;
}

declare global {
  interface Window {
    desktopPet: DesktopPetApi;
  }
}
```

- [ ] **Step 4: Create fallback asset**

Write `src/assets/default-pet.svg`:

```svg
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#3b2f4a" flood-opacity="0.28"/>
  </filter>
  <g filter="url(#shadow)">
    <ellipse cx="128" cy="134" rx="86" ry="78" fill="#fff6fb"/>
    <circle cx="91" cy="112" r="18" fill="#3a2c43"/>
    <circle cx="165" cy="112" r="18" fill="#3a2c43"/>
    <circle cx="97" cy="106" r="6" fill="#ffffff"/>
    <circle cx="171" cy="106" r="6" fill="#ffffff"/>
    <path d="M104 151 Q128 170 152 151" fill="none" stroke="#3a2c43" stroke-width="10" stroke-linecap="round"/>
    <circle cx="73" cy="142" r="13" fill="#ffb7ce" opacity="0.75"/>
    <circle cx="183" cy="142" r="13" fill="#ffb7ce" opacity="0.75"/>
    <path d="M62 60 Q74 22 102 56" fill="#fff6fb"/>
    <path d="M154 56 Q184 22 194 60" fill="#fff6fb"/>
  </g>
</svg>
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install successfully.

- [ ] **Step 6: Run initial typecheck**

Run: `npm run typecheck`

Expected: FAIL because `PetWindow` and `SettingsWindow` are imported but not created. This confirms the scaffold is wired to the renderer entry.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts index.html src/renderer/main.tsx src/renderer/App.tsx src/renderer/vite-env.d.ts src/assets/default-pet.svg
git commit -m "chore: scaffold desktop pet app"
```

If the workspace is not a Git repository, skip only this commit step and continue with the next task.

## Task 2: Shared Types And Validation

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/shared/validation.ts`
- Create: `src/shared/validation.test.ts`

- [ ] **Step 1: Write validation tests**

Write `src/shared/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, isSupportedImagePath, mergeSettings } from "./validation";

describe("isSupportedImagePath", () => {
  it("accepts png, jpg, jpeg, and webp files case-insensitively", () => {
    expect(isSupportedImagePath("pet.PNG")).toBe(true);
    expect(isSupportedImagePath("pet.jpg")).toBe(true);
    expect(isSupportedImagePath("pet.JPEG")).toBe(true);
    expect(isSupportedImagePath("pet.webp")).toBe(true);
  });

  it("rejects unsupported files", () => {
    expect(isSupportedImagePath("pet.gif")).toBe(false);
    expect(isSupportedImagePath("pet.txt")).toBe(false);
    expect(isSupportedImagePath("pet")).toBe(false);
  });
});

describe("mergeSettings", () => {
  it("keeps defaults for missing values and clamps size", () => {
    const settings = mergeSettings({ petSize: 999, bubblesEnabled: false });

    expect(settings.petSize).toBe(320);
    expect(settings.bubblesEnabled).toBe(false);
    expect(settings.alwaysOnTop).toBe(DEFAULT_SETTINGS.alwaysOnTop);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/shared/validation.test.ts`

Expected: FAIL with module resolution errors for `./validation`.

- [ ] **Step 3: Create shared types**

Write `src/shared/types.ts`:

```ts
export interface Avatar {
  id: string;
  name: string;
  originalPath: string;
  assetPath: string;
  createdAt: string;
}

export interface AppSettings {
  activeAvatarId: string | null;
  petSize: number;
  alwaysOnTop: boolean;
  animationsEnabled: boolean;
  bubblesEnabled: boolean;
}

export interface AvatarGenerationInput {
  sourcePath: string;
  outputDir: string;
  displayName: string;
  maxSize: number;
}

export interface GeneratedAvatar {
  id: string;
  name: string;
  originalPath: string;
  assetPath: string;
  createdAt: string;
}

export interface AvatarUploadResult {
  ok: boolean;
  avatar?: Avatar;
  message?: string;
}
```

- [ ] **Step 4: Create validation helpers**

Write `src/shared/validation.ts`:

```ts
import path from "node:path";
import type { AppSettings } from "./types";

const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export const DEFAULT_SETTINGS: AppSettings = {
  activeAvatarId: null,
  petSize: 180,
  alwaysOnTop: true,
  animationsEnabled: true,
  bubblesEnabled: true,
};

export function isSupportedImagePath(filePath: string): boolean {
  return SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function clampPetSize(size: number): number {
  if (!Number.isFinite(size)) return DEFAULT_SETTINGS.petSize;
  return Math.min(320, Math.max(96, Math.round(size)));
}

export function mergeSettings(input: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...input,
    petSize: clampPetSize(input.petSize ?? DEFAULT_SETTINGS.petSize),
    activeAvatarId: input.activeAvatarId ?? DEFAULT_SETTINGS.activeAvatarId,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/shared/validation.test.ts`

Expected: PASS for all validation tests.

- [ ] **Step 6: Commit**

```bash
git add src/shared/types.ts src/shared/validation.ts src/shared/validation.test.ts
git commit -m "feat: add shared desktop pet types"
```

If the workspace is not a Git repository, skip only this commit step.

## Task 3: Settings Store

**Files:**
- Create: `src/main/settings-store.ts`
- Create: `src/main/settings-store.test.ts`

- [ ] **Step 1: Write settings store tests**

Write `src/main/settings-store.test.ts`:

```ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../shared/validation";
import { SettingsStore } from "./settings-store";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "q-pet-settings-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("SettingsStore", () => {
  it("returns defaults when no settings file exists", async () => {
    const store = new SettingsStore(tempDir);
    await expect(store.load()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it("persists merged and clamped settings", async () => {
    const store = new SettingsStore(tempDir);

    const saved = await store.save({ petSize: 50, alwaysOnTop: false });
    const loaded = await store.load();

    expect(saved.petSize).toBe(96);
    expect(loaded.alwaysOnTop).toBe(false);
    expect(loaded.bubblesEnabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/main/settings-store.test.ts`

Expected: FAIL with module resolution errors for `./settings-store`.

- [ ] **Step 3: Implement settings store**

Write `src/main/settings-store.ts`:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import type { AppSettings } from "../shared/types";
import { DEFAULT_SETTINGS, mergeSettings } from "../shared/validation";

export class SettingsStore {
  private readonly settingsPath: string;

  constructor(private readonly appDataDir: string) {
    this.settingsPath = path.join(appDataDir, "settings.json");
  }

  async load(): Promise<AppSettings> {
    try {
      const raw = await fs.readFile(this.settingsPath, "utf-8");
      return mergeSettings(JSON.parse(raw) as Partial<AppSettings>);
    } catch (error) {
      if (isMissingFile(error)) return DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    }
  }

  async save(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.load();
    const next = mergeSettings({ ...current, ...patch });
    await fs.mkdir(this.appDataDir, { recursive: true });
    await fs.writeFile(this.settingsPath, JSON.stringify(next, null, 2), "utf-8");
    return next;
  }
}

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/main/settings-store.test.ts`

Expected: PASS for all settings store tests.

- [ ] **Step 5: Commit**

```bash
git add src/main/settings-store.ts src/main/settings-store.test.ts
git commit -m "feat: persist desktop pet settings"
```

If the workspace is not a Git repository, skip only this commit step.

## Task 4: Avatar Library And Local Generator

**Files:**
- Create: `src/main/avatar-library.ts`
- Create: `src/main/avatar-library.test.ts`
- Create: `src/main/avatar-generator.ts`
- Create: `src/main/avatar-generator.test.ts`
- Create: `src/main/electron-image-processor.ts`

- [ ] **Step 1: Write avatar library tests**

Write `src/main/avatar-library.test.ts`:

```ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Avatar } from "../shared/types";
import { AvatarLibrary } from "./avatar-library";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "q-pet-avatars-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("AvatarLibrary", () => {
  it("starts empty and stores avatars in newest-first order", async () => {
    const library = new AvatarLibrary(tempDir);
    const first: Avatar = makeAvatar("a", "A");
    const second: Avatar = makeAvatar("b", "B");

    expect(await library.list()).toEqual([]);
    await library.add(first);
    await library.add(second);

    expect((await library.list()).map((avatar) => avatar.id)).toEqual(["b", "a"]);
  });
});

function makeAvatar(id: string, name: string): Avatar {
  return {
    id,
    name,
    originalPath: path.join(tempDir, `${id}-original.png`),
    assetPath: path.join(tempDir, `${id}.png`),
    createdAt: new Date(`2026-05-28T00:00:0${id === "a" ? "1" : "2"}.000Z`).toISOString(),
  };
}
```

- [ ] **Step 2: Write avatar generator tests**

Write `src/main/avatar-generator.test.ts`:

```ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalAvatarGenerator, type ImageProcessor } from "./avatar-generator";

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "q-pet-generator-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("LocalAvatarGenerator", () => {
  it("copies the original and writes a normalized png asset", async () => {
    const source = path.join(tempDir, "source.png");
    await fs.writeFile(source, "source-image");
    const processor: ImageProcessor = {
      async normalizeToPng(inputPath, outputPath, maxSize) {
        await fs.writeFile(outputPath, `${path.basename(inputPath)}:${maxSize}`);
      },
    };

    const generator = new LocalAvatarGenerator(processor, () => "fixed-id", () => new Date("2026-05-28T12:00:00.000Z"));
    const avatar = await generator.generate({
      sourcePath: source,
      outputDir: tempDir,
      displayName: "Momo",
      maxSize: 512,
    });

    await expect(fs.readFile(avatar.originalPath, "utf-8")).resolves.toBe("source-image");
    await expect(fs.readFile(avatar.assetPath, "utf-8")).resolves.toBe("source.png:512");
    expect(avatar).toMatchObject({
      id: "fixed-id",
      name: "Momo",
      createdAt: "2026-05-28T12:00:00.000Z",
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/main/avatar-library.test.ts src/main/avatar-generator.test.ts`

Expected: FAIL with module resolution errors for avatar library and generator.

- [ ] **Step 4: Implement avatar library**

Write `src/main/avatar-library.ts`:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import type { Avatar } from "../shared/types";

export class AvatarLibrary {
  private readonly libraryPath: string;
  readonly avatarDir: string;

  constructor(private readonly appDataDir: string) {
    this.avatarDir = path.join(appDataDir, "avatars");
    this.libraryPath = path.join(appDataDir, "avatars.json");
  }

  async list(): Promise<Avatar[]> {
    try {
      const raw = await fs.readFile(this.libraryPath, "utf-8");
      const avatars = JSON.parse(raw) as Avatar[];
      return avatars.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      if (isMissingFile(error)) return [];
      return [];
    }
  }

  async add(avatar: Avatar): Promise<Avatar[]> {
    await fs.mkdir(this.avatarDir, { recursive: true });
    const avatars = [avatar, ...(await this.list()).filter((item) => item.id !== avatar.id)];
    await fs.writeFile(this.libraryPath, JSON.stringify(avatars, null, 2), "utf-8");
    return avatars;
  }
}

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
```

- [ ] **Step 5: Implement local avatar generator**

Write `src/main/avatar-generator.ts`:

```ts
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
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
    private readonly createId: () => string = () => crypto.randomUUID(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async generate(input: AvatarGenerationInput): Promise<GeneratedAvatar> {
    const id = this.createId();
    const avatarDir = path.join(input.outputDir, id);
    await fs.mkdir(avatarDir, { recursive: true });

    const originalExt = path.extname(input.sourcePath).toLowerCase() || ".png";
    const originalPath = path.join(avatarDir, `original${originalExt}`);
    const assetPath = path.join(avatarDir, "pet.png");

    await fs.copyFile(input.sourcePath, originalPath);
    await this.imageProcessor.normalizeToPng(input.sourcePath, assetPath, input.maxSize);

    return {
      id,
      name: input.displayName,
      originalPath,
      assetPath,
      createdAt: this.now().toISOString(),
    };
  }
}
```

- [ ] **Step 6: Implement Electron image processor**

Write `src/main/electron-image-processor.ts`:

```ts
import fs from "node:fs/promises";
import { nativeImage } from "electron";
import type { ImageProcessor } from "./avatar-generator";

export class ElectronImageProcessor implements ImageProcessor {
  async normalizeToPng(inputPath: string, outputPath: string, maxSize: number): Promise<void> {
    const image = nativeImage.createFromPath(inputPath);
    if (image.isEmpty()) {
      throw new Error("Image could not be read.");
    }

    const size = image.getSize();
    const longest = Math.max(size.width, size.height);
    const scale = longest > maxSize ? maxSize / longest : 1;
    const normalized = scale < 1
      ? image.resize({
          width: Math.max(1, Math.round(size.width * scale)),
          height: Math.max(1, Math.round(size.height * scale)),
          quality: "best",
        })
      : image;

    await fs.writeFile(outputPath, normalized.toPNG());
  }
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- src/main/avatar-library.test.ts src/main/avatar-generator.test.ts`

Expected: PASS for avatar library and generator tests.

- [ ] **Step 8: Commit**

```bash
git add src/main/avatar-library.ts src/main/avatar-library.test.ts src/main/avatar-generator.ts src/main/avatar-generator.test.ts src/main/electron-image-processor.ts
git commit -m "feat: add local avatar services"
```

If the workspace is not a Git repository, skip only this commit step.

## Task 5: Electron Main Process, IPC, And Windows

**Files:**
- Create: `src/main/windows.ts`
- Create: `src/main/ipc.ts`
- Create: `src/main/preload.ts`
- Create: `src/main/main.ts`

- [ ] **Step 1: Implement window management**

Write `src/main/windows.ts`:

```ts
import path from "node:path";
import { BrowserWindow, Menu, app } from "electron";
import type { AppSettings, Avatar } from "../shared/types";

export interface WindowState {
  settings: AppSettings;
  avatars: Avatar[];
}

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

export function createPetWindow(settings: AppSettings): BrowserWindow {
  petWindow = new BrowserWindow({
    width: settings.petSize + 80,
    height: settings.petSize + 100,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist/main/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  petWindow.setMenu(null);
  loadRenderer(petWindow, "pet");
  return petWindow;
}

export function openSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 620,
    minWidth: 380,
    minHeight: 520,
    title: "Q版桌宠设置",
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist/main/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });

  loadRenderer(settingsWindow, "settings");
  return settingsWindow;
}

export function setPetAlwaysOnTop(enabled: boolean): void {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.setAlwaysOnTop(enabled);
  }
}

export function resizePetWindow(size: number): void {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.setSize(size + 80, size + 100);
  }
}

export function showPetContextMenu(): void {
  const menu = Menu.buildFromTemplate([
    { label: "打开设置", click: () => openSettingsWindow() },
    { type: "separator" },
    { label: "退出", click: () => app.quit() },
  ]);
  menu.popup({ window: petWindow ?? undefined });
}

export function broadcastState(state: WindowState): void {
  for (const win of [petWindow, settingsWindow]) {
    if (win && !win.isDestroyed()) {
      win.webContents.send("state:changed", state);
    }
  }
}

function loadRenderer(window: BrowserWindow, view: "pet" | "settings"): void {
  if (isDev) {
    void window.loadURL(`http://127.0.0.1:5173?view=${view}`);
    return;
  }

  void window.loadFile(path.join(app.getAppPath(), "dist/renderer/index.html"), {
    query: { view },
  });
}
```

- [ ] **Step 2: Implement IPC handlers**

Write `src/main/ipc.ts`:

```ts
import path from "node:path";
import { app, dialog, ipcMain } from "electron";
import type { AppSettings } from "../shared/types";
import { isSupportedImagePath } from "../shared/validation";
import { AvatarLibrary } from "./avatar-library";
import { LocalAvatarGenerator } from "./avatar-generator";
import { ElectronImageProcessor } from "./electron-image-processor";
import { SettingsStore } from "./settings-store";
import { broadcastState, openSettingsWindow, resizePetWindow, setPetAlwaysOnTop, showPetContextMenu } from "./windows";

export function registerIpcHandlers(): void {
  const appDataDir = path.join(app.getPath("userData"), "data");
  const settingsStore = new SettingsStore(appDataDir);
  const avatarLibrary = new AvatarLibrary(appDataDir);
  const generator = new LocalAvatarGenerator(new ElectronImageProcessor());

  async function getState() {
    return {
      settings: await settingsStore.load(),
      avatars: await avatarLibrary.list(),
    };
  }

  async function publishState() {
    const state = await getState();
    broadcastState(state);
    return state;
  }

  ipcMain.handle("state:get", async () => getState());

  ipcMain.handle("avatar:choose", async () => {
    const result = await dialog.showOpenDialog({
      title: "选择Q版形象图片",
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false, message: "没有选择图片。" };
    }

    const sourcePath = result.filePaths[0];
    if (!isSupportedImagePath(sourcePath)) {
      return { ok: false, message: "只支持 PNG、JPG、JPEG、WebP 图片。" };
    }

    try {
      const avatar = await generator.generate({
        sourcePath,
        outputDir: avatarLibrary.avatarDir,
        displayName: path.basename(sourcePath, path.extname(sourcePath)),
        maxSize: 512,
      });
      await avatarLibrary.add(avatar);
      const settings = await settingsStore.save({ activeAvatarId: avatar.id });
      setPetAlwaysOnTop(settings.alwaysOnTop);
      resizePetWindow(settings.petSize);
      await publishState();
      return { ok: true, avatar };
    } catch {
      return { ok: false, message: "图片读取失败，当前桌宠不会改变。" };
    }
  });

  ipcMain.handle("avatar:set-active", async (_event, id: string) => {
    await settingsStore.save({ activeAvatarId: id });
    await publishState();
  });

  ipcMain.handle("settings:update", async (_event, patch: Partial<AppSettings>) => {
    const settings = await settingsStore.save(patch);
    setPetAlwaysOnTop(settings.alwaysOnTop);
    resizePetWindow(settings.petSize);
    await publishState();
    return settings;
  });

  ipcMain.handle("settings:open", async () => {
    openSettingsWindow();
  });

  ipcMain.handle("pet:context-menu", async () => {
    showPetContextMenu();
  });

  ipcMain.handle("app:quit", async () => {
    app.quit();
  });
}
```

- [ ] **Step 3: Implement preload bridge**

Write `src/main/preload.ts`:

```ts
import { contextBridge, ipcRenderer } from "electron";
import type { AppSettings } from "../shared/types";

contextBridge.exposeInMainWorld("desktopPet", {
  getState: () => ipcRenderer.invoke("state:get"),
  chooseAvatarFile: () => ipcRenderer.invoke("avatar:choose"),
  setActiveAvatar: (id: string) => ipcRenderer.invoke("avatar:set-active", id),
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke("settings:update", settings),
  openSettings: () => ipcRenderer.invoke("settings:open"),
  quit: () => ipcRenderer.invoke("app:quit"),
  showContextMenu: () => ipcRenderer.invoke("pet:context-menu"),
  onStateChanged: (callback: (state: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: unknown) => callback(state);
    ipcRenderer.on("state:changed", listener);
    return () => ipcRenderer.removeListener("state:changed", listener);
  },
});
```

Update `src/renderer/vite-env.d.ts` so the interface includes context menu:

```ts
/// <reference types="vite/client" />

import type { AppSettings, Avatar, AvatarUploadResult } from "../shared/types";

export interface DesktopPetApi {
  getState(): Promise<{ settings: AppSettings; avatars: Avatar[] }>;
  chooseAvatarFile(): Promise<AvatarUploadResult>;
  setActiveAvatar(id: string): Promise<void>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  openSettings(): Promise<void>;
  quit(): Promise<void>;
  showContextMenu(): Promise<void>;
  onStateChanged(callback: (state: { settings: AppSettings; avatars: Avatar[] }) => void): () => void;
}

declare global {
  interface Window {
    desktopPet: DesktopPetApi;
  }
}
```

- [ ] **Step 4: Implement Electron bootstrap**

Write `src/main/main.ts`:

```ts
import { app } from "electron";
import path from "node:path";
import { registerIpcHandlers } from "./ipc";
import { SettingsStore } from "./settings-store";
import { createPetWindow } from "./windows";

async function boot() {
  const store = new SettingsStore(path.join(app.getPath("userData"), "data"));
  const settings = await store.load();
  registerIpcHandlers();
  createPetWindow(settings);
}

app.whenReady().then(() => {
  void boot();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

app.on("activate", () => {
  if (app.isReady()) {
    void boot();
  }
});
```

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`

Expected: FAIL only because renderer `PetWindow` and `SettingsWindow` files do not exist yet. There should be no Electron main process type errors.

- [ ] **Step 6: Commit**

```bash
git add src/main/windows.ts src/main/ipc.ts src/main/preload.ts src/main/main.ts src/renderer/vite-env.d.ts
git commit -m "feat: wire electron windows and ipc"
```

If the workspace is not a Git repository, skip only this commit step.

## Task 6: Pet Window Renderer

**Files:**
- Create: `src/renderer/pet/PetWindow.tsx`
- Create: `src/renderer/pet/PetWindow.css`

- [ ] **Step 1: Create pet window component**

Write `src/renderer/pet/PetWindow.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import type { AppSettings, Avatar } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/validation";
import defaultPetUrl from "../../assets/default-pet.svg";
import "./PetWindow.css";

const LINES = ["今天也要开心呀", "我在这里陪你", "点我会弹一下", "要不要换个新造型？"];

export function PetWindow() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [bubble, setBubble] = useState<string | null>(null);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    void window.desktopPet.getState().then((state) => {
      setSettings(state.settings);
      setAvatars(state.avatars);
    });
    return window.desktopPet.onStateChanged((state) => {
      setSettings(state.settings);
      setAvatars(state.avatars);
    });
  }, []);

  const activeAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === settings.activeAvatarId) ?? null,
    [avatars, settings.activeAvatarId],
  );

  const avatarSrc = activeAvatar ? `file://${activeAvatar.assetPath.replaceAll("\\", "/")}` : defaultPetUrl;

  function speak() {
    if (!settings.bubblesEnabled) return;
    const line = LINES[Math.floor(Math.random() * LINES.length)];
    setBubble(line);
    window.setTimeout(() => setBubble(null), 2200);
  }

  function handleClick() {
    if (settings.animationsEnabled) {
      setBounce(true);
      window.setTimeout(() => setBounce(false), 420);
    }
    speak();
  }

  return (
    <main
      className="pet-shell"
      onContextMenu={(event) => {
        event.preventDefault();
        void window.desktopPet.showContextMenu();
      }}
    >
      {bubble && <div className="speech-bubble">{bubble}</div>}
      <button
        className={[
          "pet-button",
          settings.animationsEnabled ? "pet-idle" : "",
          bounce ? "pet-bounce" : "",
        ].join(" ")}
        style={{ width: settings.petSize, height: settings.petSize }}
        onClick={handleClick}
        aria-label="Q版桌宠"
      >
        <img src={avatarSrc} alt="" draggable={false} />
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Create pet styling and animation**

Write `src/renderer/pet/PetWindow.css`:

```css
html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: transparent;
}

.pet-shell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
  background: transparent;
  -webkit-app-region: drag;
}

.pet-button {
  position: relative;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  -webkit-app-region: no-drag;
  filter: drop-shadow(0 14px 18px rgba(41, 30, 49, 0.28));
}

.pet-button img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.pet-idle {
  animation: pet-float 3.2s ease-in-out infinite;
}

.pet-bounce {
  animation: pet-bounce 420ms cubic-bezier(0.2, 1.4, 0.4, 1);
}

.speech-bubble {
  position: absolute;
  bottom: calc(100% - 42px);
  left: 50%;
  transform: translateX(-50%);
  max-width: 220px;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  color: #34263e;
  font: 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  box-shadow: 0 8px 24px rgba(35, 24, 45, 0.18);
  white-space: nowrap;
  -webkit-app-region: no-drag;
}

@keyframes pet-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
}

@keyframes pet-bounce {
  0% {
    transform: translateY(0) scale(1);
  }
  45% {
    transform: translateY(-16px) scale(1.06, 0.94);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: FAIL only because `SettingsWindow` is not created yet.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/pet/PetWindow.tsx src/renderer/pet/PetWindow.css
git commit -m "feat: add interactive pet window"
```

If the workspace is not a Git repository, skip only this commit step.

## Task 7: Settings Window Renderer

**Files:**
- Create: `src/renderer/settings/SettingsWindow.tsx`
- Create: `src/renderer/settings/SettingsWindow.css`

- [ ] **Step 1: Create settings component**

Write `src/renderer/settings/SettingsWindow.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import type { AppSettings, Avatar } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/validation";
import defaultPetUrl from "../../assets/default-pet.svg";
import "./SettingsWindow.css";

export function SettingsWindow() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void window.desktopPet.getState().then((state) => {
      setSettings(state.settings);
      setAvatars(state.avatars);
    });
    return window.desktopPet.onStateChanged((state) => {
      setSettings(state.settings);
      setAvatars(state.avatars);
    });
  }, []);

  const activeAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === settings.activeAvatarId) ?? null,
    [avatars, settings.activeAvatarId],
  );
  const previewSrc = activeAvatar ? `file://${activeAvatar.assetPath.replaceAll("\\", "/")}` : defaultPetUrl;

  async function uploadAvatar() {
    setMessage("");
    const result = await window.desktopPet.chooseAvatarFile();
    setMessage(result.ok ? "形象已更新。" : result.message ?? "没有更新形象。");
  }

  async function updateSettings(patch: Partial<AppSettings>) {
    const next = await window.desktopPet.updateSettings(patch);
    setSettings(next);
  }

  return (
    <main className="settings-shell">
      <header>
        <h1>Q版桌宠设置</h1>
        <p>上传形象、调整大小，让它乖乖待在桌面上。</p>
      </header>

      <section className="preview-section">
        <div className="preview-frame">
          <img src={previewSrc} alt="当前桌宠形象" />
        </div>
        <button className="primary-button" type="button" onClick={uploadAvatar}>
          上传图片
        </button>
        {message && <p className="status-message">{message}</p>}
      </section>

      <section>
        <h2>形象列表</h2>
        <div className="avatar-list">
          {avatars.length === 0 && <p className="empty">还没有上传形象，当前使用默认桌宠。</p>}
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              className={avatar.id === settings.activeAvatarId ? "avatar-item active" : "avatar-item"}
              type="button"
              onClick={() => void window.desktopPet.setActiveAvatar(avatar.id)}
            >
              <img src={`file://${avatar.assetPath.replaceAll("\\", "/")}`} alt="" />
              <span>{avatar.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>行为</h2>
        <label className="slider-row">
          <span>大小</span>
          <input
            type="range"
            min="96"
            max="320"
            value={settings.petSize}
            onChange={(event) => void updateSettings({ petSize: Number(event.currentTarget.value) })}
          />
          <strong>{settings.petSize}px</strong>
        </label>

        <label className="toggle-row">
          <span>始终置顶</span>
          <input
            type="checkbox"
            checked={settings.alwaysOnTop}
            onChange={(event) => void updateSettings({ alwaysOnTop: event.currentTarget.checked })}
          />
        </label>
        <label className="toggle-row">
          <span>动画</span>
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(event) => void updateSettings({ animationsEnabled: event.currentTarget.checked })}
          />
        </label>
        <label className="toggle-row">
          <span>气泡台词</span>
          <input
            type="checkbox"
            checked={settings.bubblesEnabled}
            onChange={(event) => void updateSettings({ bubblesEnabled: event.currentTarget.checked })}
          />
        </label>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create settings styling**

Write `src/renderer/settings/SettingsWindow.css`:

```css
html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: #f8f5f1;
  color: #27212f;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.settings-shell {
  box-sizing: border-box;
  max-width: 460px;
  min-height: 100vh;
  padding: 22px;
}

header h1 {
  margin: 0;
  font-size: 24px;
}

header p,
.empty,
.status-message {
  margin: 6px 0 0;
  color: #71677b;
  font-size: 14px;
}

section {
  margin-top: 22px;
}

section h2 {
  margin: 0 0 10px;
  font-size: 15px;
}

.preview-section {
  display: grid;
  gap: 12px;
}

.preview-frame {
  display: grid;
  place-items: center;
  height: 180px;
  border: 1px solid #e4dce8;
  border-radius: 8px;
  background: #fffdfb;
  overflow: hidden;
}

.preview-frame img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  filter: drop-shadow(0 12px 16px rgba(44, 36, 55, 0.2));
}

.primary-button,
.avatar-item {
  border: 1px solid #d7ccd9;
  border-radius: 8px;
  background: #ffffff;
  color: #27212f;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  height: 40px;
  background: #27212f;
  color: #ffffff;
}

.avatar-list {
  display: grid;
  gap: 8px;
}

.avatar-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px;
  text-align: left;
}

.avatar-item.active {
  border-color: #8f5cff;
  box-shadow: 0 0 0 2px rgba(143, 92, 255, 0.16);
}

.avatar-item img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.slider-row,
.toggle-row {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  border-bottom: 1px solid #e7e0e9;
  font-size: 14px;
}

.toggle-row {
  grid-template-columns: 1fr auto;
}
```

- [ ] **Step 3: Run typecheck and tests**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm test`

Expected: PASS for shared, settings store, avatar library, and generator tests.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/settings/SettingsWindow.tsx src/renderer/settings/SettingsWindow.css
git commit -m "feat: add desktop pet settings window"
```

If the workspace is not a Git repository, skip only this commit step.

## Task 8: Run, Verify, And Polish

**Files:**
- Modify: files found during verification only if a command exposes a concrete defect.

- [ ] **Step 1: Build main and renderer**

Run: `npm run build`

Expected: PASS and output under `dist/main` and `dist/renderer`.

- [ ] **Step 2: Start renderer dev server**

Run: `npm run dev`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 3: Start Electron app in a second terminal**

Run: `npm run electron:start`

Expected: A transparent frameless pet window appears with the default Q pet.

- [ ] **Step 4: Manual verification checklist**

Verify each item:

```text
[ ] Pet window appears with transparent background.
[ ] Pet window is frameless.
[ ] Pet window can be dragged.
[ ] Right-click menu opens.
[ ] Settings window opens from right-click menu.
[ ] Uploading PNG/JPG/JPEG/WebP changes the pet image.
[ ] Invalid image type is rejected from the dialog filter or via validation.
[ ] Size slider resizes the pet window.
[ ] Always-on-top toggle changes window behavior.
[ ] Animation toggle stops and starts idle movement.
[ ] Bubble toggle stops and starts click text.
[ ] Uploaded avatar remains after app restart.
```

- [ ] **Step 5: Fix concrete defects found during verification**

For each defect, write the smallest failing unit test when it is service-level. For OS window behavior defects, reproduce manually, patch the relevant file, then rerun:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands PASS before completion.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "fix: polish desktop pet verification issues"
```

If no files changed or the workspace is not a Git repository, skip only this commit step.

## Self-Review Notes

- Spec coverage: transparent frameless pet window is covered in Task 5 and Task 8; drag, click animation, and bubbles in Task 6; upload and local avatar generation in Tasks 4, 5, and 7; settings and persistence in Tasks 3, 5, and 7; AI extension point in Task 4 via `AvatarGenerator`.
- Placeholder scan: no unfinished placeholder markers are intentionally left in implementation steps.
- Type consistency: shared names are `Avatar`, `AppSettings`, `AvatarGenerator`, `LocalAvatarGenerator`, `AvatarLibrary`, `SettingsStore`, and those names are used consistently across tasks.

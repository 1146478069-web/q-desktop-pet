import { mkdir, readFile, writeFile } from "node:fs/promises";
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
      const contents = await readFile(this.settingsPath, "utf8");
      return mergeSettings(JSON.parse(contents) as Partial<AppSettings>);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async save(patch: Partial<AppSettings>): Promise<AppSettings> {
    const currentSettings = await this.load();
    const nextSettings = mergeSettings({
      ...currentSettings,
      ...patch,
    });

    await mkdir(this.appDataDir, { recursive: true });
    await writeFile(this.settingsPath, `${JSON.stringify(nextSettings, null, 2)}\n`, "utf8");

    return nextSettings;
  }
}

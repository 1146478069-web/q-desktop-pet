import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Avatar } from "../shared/types";

export class AvatarLibrary {
  readonly avatarDir: string;
  private readonly libraryPath: string;

  constructor(private readonly appDataDir: string) {
    this.avatarDir = path.join(appDataDir, "avatars");
    this.libraryPath = path.join(appDataDir, "avatars.json");
  }

  async list(): Promise<Avatar[]> {
    try {
      const contents = await readFile(this.libraryPath, "utf8");
      const avatars = JSON.parse(contents) as unknown;

      if (!Array.isArray(avatars)) {
        return [];
      }

      if (!avatars.every(isAvatar)) {
        return [];
      }

      return [...avatars].sort(
        (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
      );
    } catch {
      return [];
    }
  }

  async add(avatar: Avatar): Promise<Avatar[]> {
    const currentAvatars = await this.list();
    const nextAvatars = [avatar, ...currentAvatars.filter((current) => current.id !== avatar.id)];

    await mkdir(this.avatarDir, { recursive: true });
    await writeFile(this.libraryPath, `${JSON.stringify(nextAvatars, null, 2)}\n`, "utf8");

    return this.list();
  }
}

function isAvatar(value: unknown): value is Avatar {
  if (!value || typeof value !== "object") {
    return false;
  }

  const avatar = value as Partial<Record<keyof Avatar, unknown>>;
  return (
    typeof avatar.id === "string" &&
    typeof avatar.name === "string" &&
    typeof avatar.originalPath === "string" &&
    typeof avatar.assetPath === "string" &&
    typeof avatar.createdAt === "string" &&
    !Number.isNaN(Date.parse(avatar.createdAt))
  );
}

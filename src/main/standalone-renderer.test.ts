import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("standalone renderer build", () => {
  it("generates 2.5D paper pet actions and settings controls", async () => {
    const scriptPath = path.join(process.cwd(), "scripts", "build-standalone-renderer.cjs");
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.status, result.stderr).toBe(0);

    const appJs = await readFile(path.join(process.cwd(), "dist", "renderer", "app.js"), "utf8");
    const styleCss = await readFile(path.join(process.cwd(), "dist", "renderer", "style.css"), "utf8");

    expect(appJs).toContain('visualMode: "paper3d"');
    expect(appJs).toContain('motionIntensity: "lively"');
    expect(appJs).toContain('setPetAction("carried"');
    expect(appJs).toContain('id="visualMode"');
    expect(appJs).toContain('data-intensity="soft"');
    expect(appJs).toContain('data-intensity="lively"');
    expect(styleCss).toContain(".pet-button--paper3d");
    expect(styleCss).toContain(".pet-action--annoyed");
    expect(styleCss).toContain("@keyframes pet-paper-carried");
  });
});

const fs = require("node:fs/promises");
const path = require("node:path");

const root = process.cwd();
const appName = "Q Desktop Pet";
const releaseRoot = path.join(root, "release");
const packageDir = path.join(releaseRoot, `${appName}-win32-x64`);
const electronDist = path.join(root, "node_modules", "electron", "dist");

async function main() {
  await remove(packageDir);
  await fs.mkdir(packageDir, { recursive: true });

  await copyDir(electronDist, packageDir);
  await renameIfExists(path.join(packageDir, "electron.exe"), path.join(packageDir, `${appName}.exe`));

  const appDir = path.join(packageDir, "resources", "app");
  await fs.mkdir(appDir, { recursive: true });
  await copyDir(path.join(root, "dist"), path.join(appDir, "dist"));
  await copyRuntimeDependency("pngjs", appDir);
  await copyFileIfExists(path.join(root, "LICENSE"), path.join(appDir, "LICENSE"));
  await copyFileIfExists(path.join(root, "README.md"), path.join(appDir, "README.md"));
  await fs.writeFile(
    path.join(appDir, "package.json"),
    JSON.stringify(
      {
        name: "q-desktop-pet",
        version: "0.1.0",
        main: "dist/main/main/main.js",
        license: "MIT",
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  await fs.writeFile(
    path.join(packageDir, "README.txt"),
    [
      "Q Desktop Pet",
      "",
      "Run Q Desktop Pet.exe to start.",
      "Right-click the desktop pet to open settings.",
      "Upload avatar images and reaction sounds from the settings window.",
      "",
    ].join("\r\n"),
    "utf8",
  );

  console.log(packageDir);
}

async function copyRuntimeDependency(name, appDir) {
  await copyDir(path.join(root, "node_modules", name), path.join(appDir, "node_modules", name));
}

async function copyDir(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function copyFileIfExists(source, target) {
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }
}

async function renameIfExists(source, target) {
  try {
    await fs.rename(source, target);
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }
}

async function remove(target) {
  await fs.rm(target, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

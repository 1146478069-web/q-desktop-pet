const fs = require("node:fs/promises");
const path = require("node:path");
const esbuild = require("esbuild");

const root = process.cwd();
const outDir = path.join(root, "dist", "renderer");

async function main() {
  await fs.mkdir(path.join(outDir, "assets"), { recursive: true });

  await esbuild.build({
    absWorkingDir: root,
    entryPoints: ["src/renderer/main.tsx"],
    bundle: true,
    format: "esm",
    outfile: "./dist/renderer/assets/main.js",
    loader: {
      ".svg": "dataurl",
    },
    jsx: "automatic",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    sourcemap: false,
    minify: false,
  });

  await fs.writeFile(
    path.join(outDir, "index.html"),
    [
      "<!doctype html>",
      '<html lang="zh-CN">',
      "  <head>",
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      "    <title>Q Desktop Pet</title>",
      "  </head>",
      "  <body>",
      '    <div id="root"></div>',
      '    <script type="module" src="./assets/main.js"></script>',
      "  </body>",
      "</html>",
      "",
    ].join("\n"),
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

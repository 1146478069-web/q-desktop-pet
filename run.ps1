param(
  [ValidateSet("install", "typecheck", "build", "start")]
  [string]$Command = "start"
)

$ErrorActionPreference = "Stop"

$BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (Test-Path $BundledNode) {
  $Node = $BundledNode
} else {
  $Node = "node"
}

function Invoke-Node {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & $Node @Args
}

switch ($Command) {
  "install" {
    Invoke-Node ".tools/package/bin/npm-cli.js" "install" "--cache" ".npm-cache" "--ignore-scripts"
    if (-not (Test-Path "node_modules/electron/dist/electron.exe")) {
      Write-Host "Electron binary is missing. Download it to .electron-cache and extract it before start."
    }
  }
  "typecheck" {
    Invoke-Node "node_modules/typescript/bin/tsc" "--noEmit"
    Invoke-Node "node_modules/typescript/bin/tsc" "-p" "tsconfig.node.json" "--noEmit"
  }
  "build" {
    Invoke-Node "node_modules/typescript/bin/tsc" "-p" "tsconfig.node.json"
    Invoke-Node "scripts/build-standalone-renderer.cjs"
  }
  "start" {
    Invoke-Node "node_modules/electron/cli.js" "."
  }
}

@echo off
setlocal
set "ROOT=%~dp0"
set "APPDIR=%ROOT:~0,-1%"
set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node"

if "%~1"=="install" (
  "%NODE%" "%ROOT%.tools\package\bin\npm-cli.js" install --cache "%ROOT%.npm-cache" --ignore-scripts
  goto :eof
)

if "%~1"=="typecheck" (
  "%NODE%" "%ROOT%node_modules\typescript\bin\tsc" --noEmit
  if errorlevel 1 exit /b %errorlevel%
  "%NODE%" "%ROOT%node_modules\typescript\bin\tsc" -p "%ROOT%tsconfig.node.json" --noEmit
  exit /b %errorlevel%
)

if "%~1"=="build" (
  "%NODE%" "%ROOT%node_modules\typescript\bin\tsc" -p "%ROOT%tsconfig.node.json"
  if errorlevel 1 exit /b %errorlevel%
  "%NODE%" "%ROOT%scripts\build-standalone-renderer.cjs"
  exit /b %errorlevel%
)

if "%~1"=="package" (
  call "%~f0" build
  if errorlevel 1 exit /b %errorlevel%
  "%NODE%" "%ROOT%scripts\package-win.cjs"
  if errorlevel 1 exit /b %errorlevel%
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%ROOT%release\Q Desktop Pet-win32-x64\*' -DestinationPath '%ROOT%release\Q Desktop Pet-win32-x64.zip' -Force"
  exit /b %errorlevel%
)

if "%~1"=="start" (
  start "Q Desktop Pet" "%ROOT%node_modules\electron\dist\electron.exe" "%APPDIR%"
  exit /b 0
)

echo Usage: run.cmd install ^| typecheck ^| build ^| package ^| start
exit /b 1

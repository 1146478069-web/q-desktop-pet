@echo off
call "%~dp0run.cmd" build
if errorlevel 1 exit /b %errorlevel%
call "%~dp0run.cmd" start

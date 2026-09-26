@echo off
title New Ikon Doors - Project Launcher
cd /d "%~dp0"
python start_project.py %*
if errorlevel 1 (
    echo.
    echo [!] Python not detected or exited with an error. Attempting direct npm start...
    npm run dev
)
pause
